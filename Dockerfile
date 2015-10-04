# Created with help of the blog post http://blog.codenvy.com/two-project-two-challenge-solution/
FROM codenvy/shellinabox
ENV CODENVY_APP_PORT_3000_HTTP 3000
EXPOSE 3000
RUN sudo apt-get update -y && \
sudo apt-get -y install nodejs-legacy npm
RUN mkdir -p /home/user/app
ADD geoTracker_unpack /home/user/app/
RUN sudo chown user:user -R /home/user/app
CMD cd /home/user/app
RUN sudo npm install express body-parser type-is sqlite3 http
RUN cd /home/user/app
CMD sleep 365d
# run 'cd /home/user/app' and 'node geoTracker' via terminal (Codenvy)