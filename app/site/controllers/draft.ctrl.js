(function(){
	angular
		.module('draftApp')
		.controller('DraftCtrl',DraftCtrl)

	function DraftCtrl ($timeout, $http,$routeParams,stats, playerSrv){
		var draftVm = this;
		// console.log('draft')
		console.log(stats)
		draftVm.playerStats = stats.data;
		draftVm.numTeams = 12;
		draftVm.userPick = 1;
		draftVm.rounds = [0,1,2,3,4,5,6,7,8,9,10,11,12];
		draftVm.curRound = 0;
		draftVm.curPick = 0;
		draftVm.playerSelect;
		draftVm.done = false;
		draftVm.searchName = "";
		draftVm.league = createLeague(draftVm.numTeams,draftVm.userPick);
		draftVm.draftedPlayers = [];
		draftVm.myPick = false;
		draftVm.teamSelect = draftVm.league.teams[draftVm.userPick-1];
		draftVm.goals = [14.78,3.33,5.99,1.09,0.74,1.07,46.4,78.3,2.0]
		draftVm.suggested = [draftVm.playerStats[0],
			draftVm.playerStats[1],
			draftVm.playerStats[2]];
		draftVm.drafting = false;
		//draftVm.avg = playerSrv.avgStats[draftVm.playerSelect.position];

		checkSelected();
		// draftVm.playerSelect = draftVm.filtered[1];

		//public methods
		draftVm.abbrev = abbrev;
		draftVm.show = show;
		draftVm.draft = draft;
		draftVm.checkSelected = checkSelected;
		draftVm.teamTotals = teamTotals;
		draftVm.isSuggest = isSuggest;
		draftVm.colourScale = colourScale;
		draftVm.drawChart = drawChart;

		function abbrev(name){
			var arr = name.split(" ")
			// console.log(arr)
			arr[0] = arr[0].charAt(0) + ".";
			var abbr = arr.reduce(function(a,b){
				return a+" "+b;
			})
			return abbr;
		}

		function show(player){
			draftVm.playerSelect = player;
			draftVm.drawChart();
		}

		function checkSelected(){
			draftVm.playerStats = draftVm.playerStats.filter(function(player){
				for(var i = 0;i < draftVm.league.draftedPlayers.length; i++){
					if(player.nba_id == draftVm.league.draftedPlayers[i].nba_id){
						return false;
					}
				}
				return true;
			})
		}

		function draft(player){
			draftVm.myPick = false;
			draftVm.drafting = true;
			console.log('draft')
			//calculate which team is currently picking
			if(draftVm.curRound % 2 == 0){
				var pickTeam = (draftVm.curPick % draftVm.numTeams);
				if(pickTeam + 1 == draftVm.userPick ){
					draftVm.myPick = true;
				}
			} else if(draftVm.curRound % 2 == 1){
				var pickTeam = (draftVm.numTeams-1) - (draftVm.curPick % draftVm.numTeams);
				if(pickTeam + 1 == (draftVm.numTeams-draftVm.userPick)){
					draftVm.myPick = true;
				}
			}
			console.log(pickTeam)
			
			//put selected player into appropriate team slot
			if(draftVm.league.teams[pickTeam].players[player.position] == ""){
				console.log(player.position)
				draftVm.league.teams[pickTeam].players[player.position] = player;
			} else if(draftVm.league.teams[pickTeam].players["G"] == "" && (player.position == "PG" || player.position == "SG")){
				console.log("G")
				draftVm.league.teams[pickTeam].players["G"] = player;
			} else if(draftVm.league.teams[pickTeam].players["F"] == "" && (player.position == "PF" || player.position == "SF")){
				draftVm.league.teams[pickTeam].players["F"] = player;
			} else if(draftVm.league.teams[pickTeam].players["UTIL1"] == ""){
				draftVm.league.teams[pickTeam].players["UTIL1"] = player;
			} else if(draftVm.league.teams[pickTeam].players["UTIL2"] == ""){
				draftVm.league.teams[pickTeam].players["UTIL2"] = player;
			} else if(draftVm.league.teams[pickTeam].players["UTIL3"] == ""){
				draftVm.league.teams[pickTeam].players["UTIL3"] = player;
			} else if(draftVm.league.teams[pickTeam].players["BENCH1"] == ""){
				draftVm.league.teams[pickTeam].players["BENCH1"] = player;
			} else if(draftVm.league.teams[pickTeam].players["BENCH2"] == ""){
				draftVm.league.teams[pickTeam].players["BENCH2"] = player;
			} else if(draftVm.league.teams[pickTeam].players["BENCH3"] == ""){
				draftVm.league.teams[pickTeam].players["BENCH3"] = player;
			} else {
				console.log('invalid pick')
				draftVm.drafting = false;
				return;
			}

			draftVm.league.teams[pickTeam].stats.pts += player.pts;
			draftVm.league.teams[pickTeam].stats.ast += player.ast;
			draftVm.league.teams[pickTeam].stats.reb += player.reb;
			draftVm.league.teams[pickTeam].stats.stl += player.stl;
			draftVm.league.teams[pickTeam].stats.blk += player.blk;
			draftVm.league.teams[pickTeam].stats.fg3m += player.fg3m;
			draftVm.league.teams[pickTeam].stats.fgm += player.fgm;
			draftVm.league.teams[pickTeam].stats.fga += player.fga;
			draftVm.league.teams[pickTeam].stats.ftm += player.ftm;
			draftVm.league.teams[pickTeam].stats.fta += player.fta;
			draftVm.league.teams[pickTeam].stats.tov += player.tov;
			draftVm.league.teams[pickTeam].stats.count++;

			// draftVm.league.teams[pickTeam].players.push(player);
			
			draftVm.league.draftedPlayers.push(player);
			if(draftVm.curPick % draftVm.numTeams == (draftVm.numTeams-1) && draftVm.curRound != 12){
				draftVm.curRound++;
			}
			if(draftVm.curPick == ((draftVm.numTeams * 13) - 1)){
				console.log(draftVm.done)
				draftVm.done = true;
				console.log(draftVm.league)
			}else{
				draftVm.curPick++;
			}

			// draftVm.myPick = false;
			
			//refilter players remaining
			checkSelected();

			//repopulate player info box with top remaining scorer
			
			$http.post('/api/draft/',player)
				.then(function(res){
					console.log(res);
					draftVm.playerStats = res.data;
					// draftVm.playerSelect = res.data[0];
					if(player == draftVm.filtered[0]){
						draftVm.playerSelect = draftVm.filtered[1];
					}else{
						draftVm.playerSelect = draftVm.filtered[0];
					}
					return $http.put('/api/draft/' + (draftVm.userPick - 1),draftVm.league.teams[(draftVm.userPick - 1)])
				})
				.then(function(res){
					console.log('suggested');
					console.log(res);
					draftVm.suggested = res.data;
					draftVm.drafting = false;
				})			

		}

		function teamTotals(players){
			var totals = {
				pts:0,
				ast:0,
				reb:0,
				stl:0,
				blk:0,
				fg3m:0,
				fgm:0,
				fga:0,
				ftm:0,
				fta:0,
				tov:0
			}
			for(var pos in players){
				if(players[pos] != ""){
					totals.pts += players[pos].pts;
					totals.ast += players[pos].ast;
					totals.reb += players[pos].reb;
					totals.stl += players[pos].stl;
					totals.blk += players[pos].blk;
					totals.fg3m += players[pos].fg3m;
					totals.fgm += players[pos].fgm;
					totals.fga += players[pos].fga;
					totals.ftm += players[pos].ftm;
					totals.fta += players[pos].fta;
					totals.tov += players[pos].tov;
				}
			}
			console.log(totals)
			return totals;
		}

		function createLeague(num,nth){
			var teams = [];
			for(var i = 0; i < num; i++){
				teams.push({
					teamId:i,
					teamName:'Team '+(i+1),
					user:false,
					players:{
						"PG":"",
						"SG":"",
						"SF":"",
						"PF":"",
						"C":"",
						"G":"",
						"F":"",
						"UTIL1":"",
						"UTIL2":"",
						"UTIL3":"",
						"BENCH1":"",
						"BENCH2":"",
						"BENCH3":""
					},
					stats:{
						pts:0,
						ast:0,
						reb:0,
						stl:0,
						blk:0,
						fg3m:0,
						fgm:0,
						fga:0,
						ftm:0,
						fta:0,
						tov:0,
						count:0
					}
				})
				if (nth == (i+1)){
					teams[i].user = true;
					teams[i].teamName = 'My Team';
				}
			}
			console.log(teams)
			var league = {
				id:$routeParams.leagueId,
				teams:teams,
				draftedPlayers:[],

			}
			return league;
		}

		function isSuggest(player){
			if(player){
				for(var i = 0;i < draftVm.suggested.length;i++){

					if(player.nba_id == draftVm.suggested[i].nba_id){
						return i;
					}
				}
			}
			return -1;
		}

		function colourScale(value, goal)
		{
			var style = {'font-weight':'bold'}
			// console.log(value,goal)
			//for shooting pcts
			if(goal >= 70){
				style.opacity = (0.5 +  0.05 * Math.min(Math.abs(value-goal),10));
			}else if(goal >= 40){
				style.opacity = (0.5 +  0.1 * Math.min(Math.abs(value-goal),5));
			}else{
				style.opacity = (0.5 +  Math.min(0.5 * Math.abs((value-goal)/goal),0.5));
			}
			//change color based on which is higher
			if(value < goal){
				style.color = 'red';
			}else{
				style.color = 'green';
			}
			return style;
		}

		function drawChart(){
			draftVm.avg = playerSrv.avgStats[draftVm.playerSelect.position];
			draftVm.options = {
			    chart: {
			        type: 'discreteBarChart',
			        height: 150,
			        //width: 400,
			        margin : {
			            top: 5,
			            right: 0,
			            bottom: 45,
			            left: 55
			        },
			        showControls:false,
			        reduceXTicks:false,
			        x: function(d){ return d.label; },
			        y: function(d){ return d.value; },
			        showValues: true,
			        valueFormat: function(d){
			            return d3.format(',.1f')(d);
			        },
			        transitionDuration: 500,
			        xAxis: {
			            axisLabel: 'Standard Fantasy Categories',
			            axisLabelDistance: -5
			        },
			        yAxis: {
			            axisLabel: '% : Avg '+draftVm.playerSelect.position,
			            axisLabelDistance: -5
			        }
			    }
			};

			draftVm.data = [{
			    key: draftVm.playerSelect.name,
			    values: [
			        { "label" : "PTS" , "value" : (draftVm.playerSelect.pts-draftVm.avg.pts)/draftVm.avg.pts*100},
			        { "label" : "AST" , "value" : (draftVm.playerSelect.ast-draftVm.avg.ast)/draftVm.avg.ast*100},
			        { "label" : "REB" , "value" : (draftVm.playerSelect.reb-draftVm.avg.reb)/draftVm.avg.reb*100},
			        { "label" : "STL" , "value" : (draftVm.playerSelect.stl-draftVm.avg.stl)/draftVm.avg.stl*100},
			        { "label" : "BLK" , "value" : (draftVm.playerSelect.blk-draftVm.avg.blk)/draftVm.avg.blk*100},
			        { "label" : "3PT" , "value" : (draftVm.playerSelect.fg3m-draftVm.avg.fg3m)/draftVm.avg.fg3m*100},
			        { "label" : "FG%" , "value" : ((draftVm.playerSelect.fga == 0 ? 0 : draftVm.playerSelect.fgm/draftVm.playerSelect.fga) - draftVm.avg.fgp)/draftVm.avg.fgp*100},
			        { "label" : "FT%" , "value" : ((draftVm.playerSelect.fta == 0 ? 0 : draftVm.playerSelect.ftm/draftVm.playerSelect.fta) - draftVm.avg.ftp)/draftVm.avg.ftp*100},
			        { "label" : "TO"  , "value" : (draftVm.avg.tov-draftVm.playerSelect.tov)/draftVm.avg.tov*100}
			    ]
			}];
			//window.dispatchEvent(new Event('resize'));
			$timeout(function() {
                    window.dispatchEvent(new Event('resize'));
                }, 50);
		}

	}
})();