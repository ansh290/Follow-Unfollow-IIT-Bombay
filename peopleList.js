import { LightningElement, wire, track } from 'lwc';
import getCustomerUsers from '@salesforce/apex/PeopleController.getCustomerUsers';
import getSearchUsers from '@salesforce/apex/PeopleController.getSearchUsers';
import followUser from '@salesforce/apex/PeopleController.followUser';
import unfollowUser from '@salesforce/apex/PeopleController.unfollowUser';

export default class PeopleList extends LightningElement {
    @track users = [];
    searchKey = '';

connectedCallback() {
      //  this.loadUsers();
    }

    loadUsers() {
    getSearchUsers({ searchKey: this.searchKey })
        .then(result => {
            console.log('result', result);
            this.users = result; // wrapper hai, direct use karo
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
        console.log('searchKey', this.searchKey);
    }



    @wire(getCustomerUsers)
    wiredUsers({ error, data }) {
        if (data) {
            this.users = data;
            console.log('this.users123545',JSON.stringify(this.users) );
        } else if (error) {
            console.error(error);
        }
    }
    
    handleFollow(event) {
        let userId = event.target.dataset.id;
        followUser({ userId })
            .then(() => {
                this.updateUserStatus(userId, true);
            })
            .catch(error => console.error(error));
    }

    handleUnfollow(event) {
        let userId = event.target.dataset.id;
        unfollowUser({ userId })
            .then(() => {
                this.updateUserStatus(userId, false);
            })
            .catch(error => console.error(error));
    }

    updateUserStatus(userId, isFollowed) {
        this.users = this.users.map(user =>
            user.userId === userId ? { ...user, isFollowed } : user
        );
    }
}
