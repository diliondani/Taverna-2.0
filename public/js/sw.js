var staticCacheName = 'taverna-static-v2'
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
 // Initialize the Firebase app in the service worker by passing in the
 // messagingSenderId.
 firebase.initializeApp({
   'messagingSenderId': '353890460201'
 });
 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();
 // [END initialize_firebase_in_sw]
 

/** @enum {string} */
const WorkerMessengerCommand = {
    /*
      Used to request the current subscription state.
     */
    AMP_SUBSCRIPION_STATE: 'amp-web-push-subscription-state',
    /*
      Used to request the service worker to subscribe the user to push.
      Notification permissions are already granted at this point.
     */
    AMP_SUBSCRIBE: 'amp-web-push-subscribe',
    /*
      Used to unsusbcribe the user from push.
     */
    AMP_UNSUBSCRIBE: 'amp-web-push-unsubscribe',
  };

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
                '/',
                '/sw.html',
                'public/images/sapalomera-small.svg',
                'https://cdn.ampproject.org/v0/amp-analytics-0.1.js',
                'https://cdn.ampproject.org/v0.js',
                'https://cdn.ampproject.org/v0/amp-install-serviceworker-0.1.js',
                'https://cdn.ampproject.org/v0/amp-user-notification-0.1.js',
                'https://cdn.ampproject.org/v0/amp-font-0.1.js',
                'https://fonts.googleapis.com/css?family=Roboto|Trochut:700&amp;text=Taverna',
                'https://fonts.googleapis.com/css?family=Quattrocento+Sans:400,400i,700,700i&amp;subset=latin-ext'
            ]);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('taverna-') &&
                   cacheName != staticCacheName;
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('message', event => {
    /*
      Messages sent from amp-web-push have the format:
      - command: A string describing the message topic (e.g.
        'amp-web-push-subscribe')
      - payload: An optional JavaScript object containing extra data relevant to
        the command.
     */
    const {command} = event.data;
  
    switch (command) {
      case WorkerMessengerCommand.AMP_SUBSCRIPION_STATE:
        onMessageReceivedSubscriptionState();
        break;
      case WorkerMessengerCommand.AMP_SUBSCRIBE:
        onMessageReceivedSubscribe();
        break;
      case WorkerMessengerCommand.AMP_UNSUBSCRIBE:
        onMessageReceivedUnsubscribe();
        break;
    }
  });
  
  /**
    Broadcasts a single boolean describing whether the user is subscribed.
   */
  function onMessageReceivedSubscriptionState() {
    let retrievedPushSubscription = null;
    self.registration.pushManager.getSubscription()
        .then(pushSubscription => {
          retrievedPushSubscription = pushSubscription;
          if (!pushSubscription) {
            return null;
          } else {
            return self.registration.pushManager.permissionState(
                pushSubscription.options
            );
          }
        }).then(permissionStateOrNull => {
          if (permissionStateOrNull == null) {
            broadcastReply(WorkerMessengerCommand.AMP_SUBSCRIPION_STATE, false);
          } else {
            const isSubscribed = !!retrievedPushSubscription &&
              permissionStateOrNull === 'granted';
            broadcastReply(WorkerMessengerCommand.AMP_SUBSCRIPION_STATE,
                isSubscribed);
          }
        });
  }
  
  /**
    Subscribes the visitor to push.
    The broadcast value is null (not used in the AMP page).
   */
  function onMessageReceivedSubscribe() {
    /*
      If you're integrating amp-web-push with an existing service worker, use your
      existing subscription code. The subscribe() call below is only present to
      demonstrate its proper location. The 'fake-demo-key' value will not work.
      If you're setting up your own service worker, you'll need to:
        - Generate a VAPID key (see:
          https://developers.google.com/web/updates/2016/07/web-push-interop-wins)
        - Using urlBase64ToUint8Array() from
          https://github.com/web-push-libs/web-push, convert the VAPID key to a
          UInt8 array and supply it to applicationServerKey
     */
    
    // self.registration.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: 'AAAAUmWD4ik:APA91bE0iVAOi0Eld_lHWtwsMMW2ToG_zWSI17nqijQPFzAa5Tppmth_K8v_JrMMwiMDpuyTuRN1m3otd8RJL18dqzWnzeJc_VU-XpGH-aEmK1v9k1Gj7i2tNpJnCf9QvbXZoOeaHuHo',
    // }).then(() => {
    //   // IMPLEMENT: Forward the push subscription to your server here

    //   broadcastReply(WorkerMessengerCommand.AMP_SUBSCRIBE, null);
    // });
    messaging.getToken().then(token => {
      console.log(token);
      
      broadcastReply(WorkerMessengerCommand.AMP_SUBSCRIBE, null);
    });
  }
  
  
  /**
    Unsubscribes the subscriber from push.
    The broadcast value is null (not used in the AMP page).
   */
  function onMessageReceivedUnsubscribe() {
    self.registration.pushManager.getSubscription()
        .then(subscription => subscription.unsubscribe())
        .then(() => {
          // OPTIONALLY IMPLEMENT: Forward the unsubscription to your server here
          broadcastReply(WorkerMessengerCommand.AMP_UNSUBSCRIBE, null);
        });
  }
  
  /**
    Sends a postMessage() to all window frames the service worker controls.
   */
  function broadcastReply(command, payload) {
    self.clients.matchAll()
        .then(clients => {
          for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            client./*OK*/postMessage({
              command,
              payload,
            });
          }
        });
  }

  