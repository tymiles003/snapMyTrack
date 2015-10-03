# Created with help of the blog post http://blog.codenvy.com/two-project-two-challenge-solution/
FROM codenvy/shellinabox
ENV CODENVY_APP_PORT_8081_HTTP 8081
EXPOSE 8081
RUN sudo apt-get update -y && \\
sudo apt-get -y install nodejs-legacy npm
RUN mkdir -p /home/user/app
ADD $app$ /home/user/app/
RUN sudo chown user:user -R /home/user/app && \
  	 cd /home/user/app && sudo npm install express body-parser type-is sqlite3
CMD cd /home/user/app && node app
CMD sleep 365d
