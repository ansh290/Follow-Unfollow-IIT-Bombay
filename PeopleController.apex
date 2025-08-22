public with sharing class PeopleController {
    
    @AuraEnabled
    public static void followUser(Id targetUserId) {
        // Check if already following
        List<EntitySubscription> existing = [
            SELECT Id 
            FROM EntitySubscription
            WHERE ParentId = :targetUserId 
            AND SubscriberId = :UserInfo.getUserId()
            LIMIT 1
        ];
        
        if (existing.isEmpty()) {
            EntitySubscription follow = new EntitySubscription(
                ParentId = targetUserId,
                SubscriberId = UserInfo.getUserId()
            );
            insert follow;
        }
    }

    @AuraEnabled
    public static void unfollowUser(Id targetUserId) {
        List<EntitySubscription> existing = [
            SELECT Id 
            FROM EntitySubscription
            WHERE ParentId = :targetUserId 
            AND SubscriberId = :UserInfo.getUserId()
            LIMIT 1
        ];
        if (!existing.isEmpty()) {
            delete existing;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<User> getCustomerUsers(String searchKey) {
        String key = '%' + searchKey + '%';
        return [
            SELECT Id, Name, SmallPhotoUrl, Email
            FROM User
            WHERE IsActive = true
            AND (Profile.UserLicense.Name = 'Customer Community'
            OR Profile.Name = 'System Administrator')
            AND Name LIKE :key
            AND Id != :UserInfo.getUserId()
            LIMIT 50
        ];
    }
}
