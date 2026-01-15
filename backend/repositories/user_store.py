class UserStore:
    def __init__(self):
        self.users = {}

    def get_user(self, username):
        return self.users.get(username)

    def add_user(self, user):
        self.users[user.username] = user