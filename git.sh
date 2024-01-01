

echo "enter commit msg : "

read commit_msg



git add .
git commit -m \'$commit_msg\'
git push


# # git add .
# echo git commit -m "$commit_msg"
# # git push