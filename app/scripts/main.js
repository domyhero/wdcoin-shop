window.APIHost = 'http://innerpay.wandoujia.com/prop/';

/*
TODO:
1 API 抽象（jsonp 更加方便，处理 errorCode 之类的）
2 代码重新组织
3 alert 美化（动画）
4 viewChange 的动画（loading indicator, 等）
*/

var pageSell = new Vue({
    el: '.page-sell',
    created: function() {
        this.$dispatch('child-created', this);
        fetchPageSellData();
        window.setInterval(function() {
            if (location.hash && location.hash === '#page-sell') {
                fetchPageSellData();
            }
        }, 4000);
    },
    methods: {
        triggerBuy: function(item) {
            // 购买单品
            if (!window.wdc_isLogin) {
                pmtAlert('请您先到客户端登录豌豆荚帐号', true);
                return;
            }
            $.ajax({
                jsonp: 'callBack',
                url: APIHost + 'subtractinventory',
                contentType: 'application/json',
                dataType: 'jsonp',
                data: {
                    goodsId: item.id
                },
                success: function(data) {
                    if (data.errorCode !== 'SUCCESS') {
                        if (data.errorMsg) {
                            pmtAlert(data.errorMsg);
                        } else {
                            pmtAlert('系统异常，请稍后再试');
                        }
                        return;
                    }
                    if (data.basicJson) {
                        toast('为避免订单失效，请在 15 分钟内进行支付')
                        invokeNativePay($.extend({
                            action: 'pay',
                            appId: '100008453',
                            // appId: '100000225',
                            subject: 'test'
                        }, {
                            out_trade_no: data.basicJson,
                            money: item.curPriceStr * 100,
                            desc: item.name
                        }));
                    } else {
                        pmtAlert('该商品已经被抢光了，再去看看其他商品吧');
                    }
                    // bind to scope
                }
            });
            // or invoke intent for buy item
        }
    }
});

var pageMy = new Vue({
    el: '.page-my',
    methods: {
        backToSell: backToSell
    }
});

var pageAbout = new Vue({
    el: '.page-about',
    methods: {
        backToSell: backToSell
    },
    created: function() {
        // about 页面接口
        $.ajax({
            jsonp: 'callBack',
            url: APIHost + 'instruction',
            contentType: 'application/json',
            dataType: 'jsonp',
            success: function(data) {
                pageAbout.$data.desc = data.basicJson;
            }
        });
    }
});

var App = new Vue({
    el: 'body',
    data: {
        currentPage: 'page-sell'
    },
    methods: {
        switchTo: function(page) {
            if (page === 'page-my') {
                if (!window.wdc_isLogin) {
                    pmtAlert('请您先到客户端登录豌豆荚帐号', true);
                    return;
                } else {
                    // 获取自己的列表，存入 scope
                    $.ajax({
                        jsonp: 'callBack',
                        url: APIHost + 'boughtgoods',
                        contentType: 'application/json',
                        dataType: 'jsonp',
                        success: function(data) {
                            if (data.errorCode !== 'SUCCESS') {
                                if (data.errorMsg) {
                                    pmtAlert(data.errorMsg);
                                } else {
                                    pmtAlert('系统异常，请稍后再试');
                                }
                                return;
                            }
                            pageMy.$data = JSON.parse(data.basicJson);
                        }
                    });
                }
            }
            switchToPage(page);
        }
    }
});

function readyToShow(page) {
    $('.wdc-page-current').removeClass('wdc-page-current');
    $(page.$el).addClass('wdc-page-current');
}

function backToSell() {
    switchToPage('page-sell');
}

var pageTitleDict = {
    'page-about': '闪电发货、双倍赔付承诺',
    'page-sell': '豌豆币道具商城',
    'page-my': '我购买到的商品'
};

function switchToPage(page) {
    $('body').scrollTop(0);
    $('.wdc-page-current').removeClass('wdc-page-current');
    $('.' + page).addClass('wdc-page-current');
    // document.title update
    document.title = pageTitleDict[page];
    location.hash = page;
}

function toast(msg) {
    window.campaignPlugin.toast(msg);
}

function fetchPageSellData() {
    $.ajax({
        jsonp: 'callBack',
        url: APIHost + 'propgoods',
        contentType: 'application/json',
        dataType: 'jsonp',
        success: function(data) {
            pageSell.$data = JSON.parse(data.basicJson);
            readyToShow(pageSell);
        }
    });
}

function initNativePay() {
    window.campaignPlugin.startActivity('intent:#Intent;launchFlags=0x10000000;component=com.wandoujia.phoenix2/com.wandoujia.p4.payment.plugin.adapter.PaySdkPluginTransferActivity;S.paysdk_commands=%7B%22package_name%22%3A%22com.wandoujia.wdpaydemo2.wdj%22%2C%22action%22%3A%22wandoujia_platform_init%22%2C%22appId%22%3A%22100008453%22%2C%22secretKey%22%3A%222a681be5af6b0da4b1b9a4bf70509259%22%2C%22need_login%22%3Atrue%7D;end');
}

function invokeNativePay(param) {
    param = encodeURI(JSON.stringify(param));
    window.campaignPlugin.startActivity('intent:#Intent;launchFlags=0x10000000;component=com.wandoujia.phoenix2/com.wandoujia.p4.payment.plugin.adapter.PaySdkPluginTransferActivity;S.paysdk_commands=' + param + ';end');
}

function invokeNativeLogin() {
    window.campaignPlugin.startActivity('intent:#Intent;launchFlags=0x10000000;component=com.wandoujia.phoenix2/com.wandoujia.p4.account.activity.PhoenixAccountActivity;end');
}

function invokeWebLogin() {
    SnapPea.AccountHook.openAsync('login').then(function() {
        initWdjAuth();
    });
}

function pmtAlert(msg, isLogin) {
    var tpl =
        ['<div class="pmt-popup pmt-popup-alert">',
        '<div class="popup-container">',
        '<div class="popup-content">',
        '<p>{{msg}}</p>',
        '<div class="popup-ctrl">',
        '<button class="w-btn cancel">我知道了</button>',
        '</div></div></div></div>'
    ].join('');

    tpl = tpl.replace('{{msg}}', msg);

    var $alert = $(tpl);
    if (isLogin) {
        $alert.find('.popup-ctrl').prepend('<button class="w-btn w-btn-primary login">去登录</button>');
    }

    $alert.find('.popup-ctrl .cancel').click(function() {
        // remove it
        $alert.remove();
    });
    $alert.find('.popup-ctrl .login').click(function() {
        // remove it
        $alert.remove();
        invokeWebLogin();
    });

    // append to body
    $('body').append($alert);
}

function initWdjAuth(fromBanner) {
    // get wdj_auth from bannner to set it
    if(fromBanner) {
        var _auth = window.cookieManager.getCookie('wdj_auth');
        window.wdc_isLogin = false;
        if (_auth && _auth !== 'false') {
            window.wdc_isLogin = true;
            window.cookieManager.setCookie('wdj_auth', _auth, 2020, 1, 1, '/', 'wandoujia.com');
        }
    } else {
        // cookie by account sdk is saved .wandoujia domain
        window.wdc_isLogin = true;
    }

}

$(window).on('hashchange', function(e) {
    var page = location.hash || '#page-sell';
    switchToPage(page.replace('#', ''));
});

// polyfill toast
if (!window.campaignPlugin) {
    window.campaignPlugin = {
        toast: function(msg) {
            window.alert(msg);
        }
    }
}
if (!window.campaignPlugin.startActivity) {
    window.campaignPlugin.startActivity = function() {
        pmtAlert('对不起您还不支持...');
    }
}
initNativePay();

// cookie related
(function() {
    // get & set wdj_auth,
    window.cookieManager = {
        getCookie: function(name) {
            var pattern = RegExp(name + "=.[^;]*")
            matched = document.cookie.match(pattern)
            if (matched) {
                var cookie = matched[0].split('=')
                return cookie[1]
            }
            return false
        },
        setCookie: function(name, value, exp_y, exp_m, exp_d, path, domain, secure) {
            var cookie_string = name + "=" + escape(value);
            if (exp_y) {
                var expires = new Date(exp_y, exp_m, exp_d);
                cookie_string += "; expires=" + expires.toGMTString();
            }
            if (path) cookie_string += "; path=" + escape(path);
            if (domain) cookie_string += "; domain=" + escape(domain);
            if (secure) cookie_string += "; secure";
            document.cookie = cookie_string;
        }
    };

    initWdjAuth(true);

    // get uid by account http
    // $.ajax({
    //     dataType: 'jsonp',
    //     url: 'https://account.wandoujia.com/v4/api/profile',
    //     success: function(resp) {
    //         var uid = resp.member ? resp.member.uid : '';
    //     }
    // });
})();