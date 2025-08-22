import { LightningElement, track } from 'lwc';
import getCustomerUsers from '@salesforce/apex/PeopleController.getCustomerUsers';
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
        getCustomerUsers({ searchKey: this.searchKey })
            .then(result => {
                this.users = result.map(u => ({
                    ...u,
                    isFollowing: false // you can later query to check this
                }));
                this.errorMessage = result.length === 0 ? 'No users found' : '';
            })
            .catch(error => {
                this.users = [];
                this.errorMessage = error?.body?.message || 'Error loading users';
            });
    }

    handleSearch(event) {
        this.searchKey = event.target.value;
        this.loadUsers();
    }

    handleUnFollow(event) {
        const userId = event.target.dataset.id;
        console.error('userId>>>>>>>>>>>>>>>>>>>>>>', userId);
        unfollowUser({ targetUserId: userId })
            .then(() => {
                this.showToast('Success', 'Now following user!', 'success');
            })
           .catch(error => {
    console.error('Follow error: ', JSON.stringify(error));
    this.showToast('Error', error?.body?.message || error.message || 'Failed to follow user', 'error');
});
    }

    handleFollow(event) {
        const userId = event.target.dataset.id;
        console.log('userId>>>>>>>>>>>>>>>>>>>>>>', userId);
        followUser({ targetUserId: userId })
            .then(() => {
                this.showToast('Success', 'Now following user!', 'success');
                console.log('targetUserId>>>>>>>>>>>>>>>>>>>>>>', targetUserId);
            })
           .catch(error => {
    console.error('Follow error: ', JSON.stringify(error));
    this.showToast('Error', error?.body?.message || error.message || 'Failed to follow user', 'error');
});
console.log('targetUserId>>>>>>>>>>>>>>>>>>>>>>', targetUserId);
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}
