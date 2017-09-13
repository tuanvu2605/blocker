var admobid = {};
if( /(android)/i.test(navigator.userAgent) ) { 
    admobid = { // for Android
        banner: 'ca-app-pub-9241292359230405/4496216589',
        interstitial: 'ca-app-pub-9241292359230405/1633044249'
    };
} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
    admobid = { // for iOS
        banner: 'ca-app-pub-9241292359230405/4294990312',
        interstitial: 'ca-app-pub-9241292359230405/1215634175'
    };
} else {
    admobid = { // for Windows Phone
        banner: 'ca-app-pub-6869992474017983/8878394753',
        interstitial: 'ca-app-pub-6869992474017983/1355127956'
    };
}

if(( /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent) )) {
    document.addEventListener('deviceready', initApp, false);
} else {
    initApp();
}

function initApp() {
    if (! AdMob ) { alert( 'admob plugin not ready' ); return; }

    // AdMob.createBanner( {
    //     adId: admobid.banner, 
    //     isTesting: true,
    //     overlap: true, 
    //     offsetTopBar: false, 
    //     position: AdMob.AD_POSITION.TOP_CENTER,
    //     bgColor: 'black'
    // } );
    
    AdMob.prepareInterstitial({
        adId: admobid.interstitial,
        autoShow: false
    });
}

