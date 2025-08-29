import { LightningElement, track } from 'lwc';
import getCustomerUsers from '@salesforce/apex/PeopleController.getCustomerUsers';
import getSearchUsers from '@salesforce/apex/PeopleController.getSearchUsers';
import followUser from '@salesforce/apex/PeopleController.followUser';
import unfollowUser from '@salesforce/apex/PeopleController.unfollowUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class People extends LightningElement {
    @track users = [];
    @track errorMessage = '';
    searchKey = '';

    connectedCallback() {
        this.loadUsers();
    }

    loadUsers() {
        // Use search method if there's a search key, otherwise get all users
        const method = this.searchKey.trim() ? getSearchUsers : getCustomerUsers;
        const params = this.searchKey.trim() ? { searchKey: this.searchKey.trim() } : {};

        method(params)
            .then(result => {
                this.users = result || [];
                this.errorMessage = this.users.length === 0 ? 'No users found' : '';
            })
            .catch(error => {
                console.error('Error loading users:', error);
                this.users = [];
                this.errorMessage = error?.body?.message || 'Error loading users';
            });
    }

    handleSearch(event) {
        this.searchKey = event.target.value || '';
        // Add a small delay to avoid too many server calls
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadUsers();
        }, 300);
    }

    handleUnfollow(event) {
        const userId = event.target.dataset.id;
        console.log('Unfollowing userId:', userId);
        
        unfollowUser({ targetUserId: userId })
            .then(() => {
                this.showToast('Success', 'Unfollowed user!', 'success');
                // Update local state
                this.updateUserFollowStatus(userId, false);
            })
            .catch(error => {
                console.error('Unfollow error: ', error);
                this.showToast('Error', error?.body?.message || error.message || 'Failed to unfollow user', 'error');
            });
    }

    handleFollow(event) {
        const userId = event.target.dataset.id;
        console.log('Following userId:', userId);
        
        followUser({ targetUserId: userId })
            .then(() => {
                this.showToast('Success', 'Now following user!', 'success');
                // Update local state
                this.updateUserFollowStatus(userId, true);
            })
            .catch(error => {
                console.error('Follow error: ', error);
                this.showToast('Error', error?.body?.message || error.message || 'Failed to follow user', 'error');
            });
    }

    // Helper method to update follow status locally without reloading
    updateUserFollowStatus(userId, isFollowed) {
        this.users = this.users.map(user => 
            user.userId === userId ? { ...user, isFollowed } : user
        );
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}
