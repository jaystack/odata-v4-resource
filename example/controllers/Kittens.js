var express = require('express');
var router = express.Router();

var ODataController = require('../../lib/index').ODataController;
var createODataPath = require('../../lib/index').createODataPath;
var metadata = require('../metadata');

function KittenController(req, res, next){
    this.JustACat = {
        value: {
            Name: 'Just a cat'
        }
    };
    this.Meow = function(cats){
        var m = [];
        for (var i = 0; i < cats; i++){
            m.push('meow');
        }
        return {
			value: m
		};
    };
    this.Kittens = function(key){
        return new Promise(function(resolve, reject){
            var start = Date.now();
            setTimeout(function(){
                resolve({
                    vmi: 'vmi',
                    key: key,
                    delta: Date.now() - start
                });
            }, Math.random() * 3000);
        });
    };
    this.$value = function(){
        return { value: 'myValue', context: this };
    };
}

router.use(ODataController(KittenController, metadata));

module.exports = router;