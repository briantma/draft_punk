var models 	= require('./../models');
var router 	= require('express').Router();


//get all stats
router.get('/', function(req, res) {
	// console.log(req.body)
	models.Stats.findAll().then(function(stats){
		res.json(stats);
	})

});

router.get('/demo',function(req,res){
	var where = {where:{$or:[
		{name:'Stephen Curry'},
		{name:'James Harden'},
		{name:'Kawhi Leonard'},
		{name:'Anthony Davis'},
		{name:'Karl-Anthony Towns'}]
	}}
	models.Stats.findAll(where).then(function(stats){
		// console.log(stats)
		res.json(stats);
	})
})

router.get('/demo2',function(req,res){
	var where = {where:{$or:[
		{name:'Russell Westbrook'},
		{name:'Klay Thompson'},
		{name:'Kevin Durant'},
		{name:'Draymond Green'},
		{name:'Hassan Whiteside'}]
	}}
	models.Stats.findAll(where).then(function(stats){
		// console.log(stats)
		res.json(stats);
	})
})

router.get('/raptors',function(req,res){
	var where = {where:{$or:[
		{name:'Kyle Lowry'},
		{name:'DeMar DeRozan'},
		{name:'Terrence Ross'},
		{name:'Patrick Patterson'},
		{name:'Jonas Valanciunas'}]
	}}
	models.Stats.findAll(where).then(function(stats){
		// console.log(stats)
		res.json(stats);
	})
})


//get stats for specific player
router.get('/:playerId', function(req, res) {
	// console.log(req.body)
	// console.log(req.params.playerId)
});

router.get('/init', function(req, res){
	//load positions from file if necessary
})

module.exports = router;