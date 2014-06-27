var pageSell = new Vue({
    el: '.page-sell',
    data: {
        list: [{
            title: '超级英雄元宝礼包'
        }, {
            title: '超级英雄元宝礼包'
        }, {
            title: '超级英雄元宝礼包'
        }]
    },
    created: function() {
        this.$dispatch('child-created', this);
        // this.$data.currentPage = this.$parent.$data.currentPage;
    },
    methods: {
        onClick: function(e) {
            console.log(e.target.tagName) // "A"
            console.log(e.targetVM === this) // true
        },
        switchTo: function(page) {
            switchToPage(page);
        },
        triggerBuy: function(item) {
            console.log(item);
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

var App = new Vue({
    el: 'body',
    data: {
        currentPage: 'page-sell'
    },
    created: function() {
        // this.$on('changePage', function(child) {
        //     console.log('new child created: ')
        //     console.log(child)
        // });
    }
});


// use $dispatch and $on
// use $parent hook