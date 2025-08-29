public with sharing class PeopleController {

    // Get users with follow status
    @AuraEnabled(cacheable=true)
    public static List<UserWrapper> getCustomerUsers() {
        List<User> users = [
            SELECT Id, Name, SmallPhotoUrl
            FROM User
            WHERE IsActive = true
            AND Id != :UserInfo.getUserId()
            LIMIT 50
        ];

        // Query which users current user follows
        Set<Id> followedIds = new Set<Id>();
        for (EntitySubscription es : [
            SELECT ParentId
            FROM EntitySubscription
            WHERE SubscriberId = :UserInfo.getUserId()
            LIMIT 1000
        ]) {
            followedIds.add(es.ParentId);
        }

        List<UserWrapper> results = new List<UserWrapper>();
        for (User u : users) {
            results.add(new UserWrapper(
                u.Id, 
                u.Name, 
                u.SmallPhotoUrl, 
                followedIds.contains(u.Id)
            ));
        }
        return results;
    }
     @AuraEnabled(cacheable=true)
    public static List<User> getSearchUsers(String searchKey) {
        String key = '%' + searchKey + '%';
        return [
            SELECT Id, Name, SmallPhotoUrl, Email
            FROM User
            WHERE IsActive = true
            AND (Profile.UserLicense.Name = 'Customer Community'
            OR Profile.Name = 'System Administrator')
            AND CommunityNickname LIKE :key
            AND Id != :UserInfo.getUserId()
            LIMIT 50
        ];
    }


    // Follow user
    @AuraEnabled
    public static void followUser(Id userId) {
        if (userId == null) return;
        // Avoid duplicates
        List<EntitySubscription> existing = [
            SELECT Id FROM EntitySubscription
            WHERE SubscriberId = :UserInfo.getUserId()
            AND ParentId = :userId
            LIMIT 1
        ];
        if (existing.isEmpty()) {
            EntitySubscription es = new EntitySubscription(
                SubscriberId = UserInfo.getUserId(),
                ParentId = userId,
                NetworkId = '0DBWd0000006mHNOAY'
            );
            insert es;
        }
    }
    

    // Unfollow user
    @AuraEnabled
    public static void unfollowUser(Id userId) {
        List<EntitySubscription> subs = [
            SELECT Id FROM EntitySubscription
            WHERE SubscriberId = :UserInfo.getUserId()
            AND ParentId = :userId
            LIMIT 1
        ];
        if (!subs.isEmpty()) {
            delete subs;
        }
    }

    public class UserWrapper {
        @AuraEnabled public Id userId;
        @AuraEnabled public String name;
        @AuraEnabled public String photoUrl;
        @AuraEnabled public Boolean isFollowed;

        public UserWrapper(Id id, String n, String url, Boolean followed) {
            userId = id;
            name = n;
            photoUrl = url;
            isFollowed = followed;
        }
    }
}
