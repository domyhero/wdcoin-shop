window.APIHost = 'http://ag-test.wandoujia.com/prop/';

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
        $.ajax({
            jsonp: 'callBack',
            url: APIHost + 'propgoods',
            contentType: 'application/json',
            dataType: 'jsonp',
            success: function(data) {
                pageSell.$data = JSON.parse(data.basicJson);
                console.log(data);
                // bind to scope
            }
        });
    },
    methods: {
        onClick: function(e) {
            console.log(e.target.tagName) // "A"
            console.log(e.targetVM === this) // true
        },
        switchTo: function(page) {
            if (page === 'page-my' && !window.wdc_isLogin) {
                pmtAlert('请先登录');
                // return;
            }
            switchToPage(page);
        },
        triggerBuy: function(item) {
            console.log(item);
            // 购买单品
            $.ajax({
                jsonp: 'callBack',
                url: APIHost + 'subtractinventory',
                contentType: 'application/json',
                dataType: 'jsonp',
                data: {
                    goodsId: item.id
                },
                headers: {
                    cookie: 'wdj_auth=_V3YnJ1Y2UuYmFpQHdhbmRvdWppYS5jb206MTQzMzM1NjEyNTAxMzpmNDhlNjQ0YzJhNzUzYTM1OTM0ZDIzZWQ4MWM2OWU4Nw'
                },
                success: function(data) {
                    console.log(data);
                    // bind to scope
                }
            });
            pmtAlert('买完啦');
            // or invoke intent for buy item
        }
    }
});

var pageMy = new Vue({
    el: '.page-my',
    data: {
        list: [{
            title: '超级英雄元宝礼包'
        }, {
            title: '超级英雄元宝礼包'
        }, {
            title: '超级英雄元宝礼包'
        }]
    },
    methods: {
        backToSell: backToSell
    },
    created: function() {
        // 获取自己的列表，存入 scope
        $.ajax({
            jsonp: 'callBack',
            url: APIHost + 'boughtgoods',
            contentType: 'application/json',
            dataType: 'jsonp',
            headers: {
                cookie: 'wdj_auth=_V3YnJ1Y2UuYmFpQHdhbmRvdWppYS5jb206MTQzMzM1NjEyNTAxMzpmNDhlNjQ0YzJhNzUzYTM1OTM0ZDIzZWQ4MWM2OWU4Nw'
            },
            success: function(data) {
                console.log(data);
            }
        });
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
                console.log(data);
            }
        });
    }
});

var App = new Vue({
    el: 'body',
    data: {
        currentPage: 'page-sell'
    }
});

function backToSell() {
    switchToPage('page-sell');
}

function switchToPage(page) {
    $('body').scrollTop(0);
    $('.wdc-page-current').removeClass('wdc-page-current');
    $('.' + page).addClass('wdc-page-current');
}

function pmtAlert(msg) {
    var tpl =
        ['<div class="pmt-popup pmt-popup-alert">',
        '<div class="popup-container">',
        '<div class="popup-content">',
        '<p>{{msg}}</p>',
        '<div class="popup-ctrl">',
        '<button class="w-btn w-btn-grand">知道了</button>',
        '</div></div></div></div>'
    ].join('');

    tpl = tpl.replace('{{msg}}', msg);

    var $alert = $(tpl);
    $alert.find('.popup-ctrl button').click(function() {
        // remove it
        $alert.remove();
    });

    // append to body
    $('body').append($alert);
}


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

    // polyfill toast
    if (!window.campaignPlugin) {
        window.campaignPlugin = {
            toast: function(msg) {
                window.alert(msg);
            }
        }
    }


    // get wdj_auth from bannner to set it
    var _auth = window.cookieManager.getCookie('wdj_auth');
    window.wdc_isLogin = false;
    if (_auth) {
        window.wdc_isLogin = true;
    }
    window.cookieManager.setCookie('wdj_auth', _auth, 2020, 1, 1, '/', 'wandoujia.com');

    // get uid by account http
    $.ajax({
        dataType: 'jsonp',
        url: 'https://account.wandoujia.com/v4/api/profile',
        success: function(resp) {
            var uid = resp.member ? resp.member.uid : '';
        }
    });
})();


// use $dispatch and $on
// use $parent hook