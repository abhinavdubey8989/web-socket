# steps for adding multiple git users
- generate ssh keys locally & update on git setttings

- in local machine , update ~/.ssh/config , add the below :

- Host github.com AddKeysToAgent yes UseKeychain yes IdentityFile ~/.ssh/private-ssh-file

- push to github