//
//  ViewController.m
//  Blocker
//
//  Created by Tuan Vu on 9/12/17.
//  Copyright © 2017 Tuan Vu. All rights reserved.
//

#import "ViewController.h"
#import <WebKit/WebKit.h>
#import <GCDWebServer/GCDWebServer.h>
#import <GCDWebServer/GCDWebServerDataResponse.h>
#define WK_COMMON_MESS @"common_mess"
@interface ViewController ()<WKScriptMessageHandler,WKNavigationDelegate>
@property (nonatomic , strong) WKWebView *webView;
@end

@implementation ViewController
{
    GCDWebServer *webServer;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    WKUserContentController *controller = [[WKUserContentController alloc]init];
    WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc]init];
    [controller addScriptMessageHandler:self name:WK_COMMON_MESS];
    config.userContentController = controller;
    _webView = [[WKWebView alloc]initWithFrame:self.view.frame configuration:config];
    _webView.navigationDelegate = self;
    [self.view addSubview:_webView];
    NSBundle *mainBundle = [NSBundle mainBundle];
    NSString *folderPath = [mainBundle pathForResource:@"www" ofType:nil];
    webServer = [[GCDWebServer alloc] init];
    [webServer addGETHandlerForBasePath:@"/" directoryPath:folderPath indexFilename:@"index.html" cacheAge:31536000 allowRangeRequests:YES];
    [webServer startWithPort:8080 bonjourName:nil];
    if (webServer.serverURL) {
        [_webView loadRequest:[NSURLRequest requestWithURL:webServer.serverURL]];
    }else{
        
        [_webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"http://localhost:8080"]]];
    }
    _webView.userInteractionEnabled  = YES;

    // Do any additional setup after loading the view, typically from a nib.
}

-(void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message
{

}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


@end
