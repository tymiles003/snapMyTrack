# snapMyTrack (alpha)
*Share your track / location, simple and secure (Web app)*

On the one hand, **'SnapMyTrack'** is a location sharing app (pure html/Javascript),
on the other hand it is a proof of concept for developing a node.js app with **MongoLab** (http://mongolab.com) integration by using a browser only (i.e. Chromebook). Mail gets sent via **SendGrid** (http://sendgrid.com).
Up to now it looks like you can built such a app with NO money and finally host it via **OpenShift** (https://www.openshift.com). The only few bucks I spent up to now, was for the domain 'snapmytrack.com' (GoDaddy -> maintain DNS to redirect to OpenShift).

Development environment:
- KODING (http://koding.com) -> works best for me, as there are no proxy issues in corporate environments
- SecureShell (https://chrome.google.com/webstore/search/secure%20shell, SSH via browser) -> needed to set environment variable on OpenShift
- GitHub (I am pushing to Github and OpenShift)

Remark: IDEs Codenvy(not free/monthly limit 20GBH) and Nitrous (proxy support missing / they deleted my workspace after two weeks) are good, too ... if you can live with the 'limitations'.  
