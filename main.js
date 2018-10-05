var day_txt = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var month_txt = [ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ];
var wwo_api_key = "1dc62aa250664e5ea6c181443161908";
var wwo_tz_api_key = "1dc62aa250664e5ea6c181443161908";
var wwo_zip_code = "55425";
var hourAdjust = 0;

function getEvents(){
	$('.weather_box').remove();
	var feed = "https://moaapi.net/resttest";

	$.ajax(feed, {
		accepts: {
			xml: "application/rss+xml"
		},
		dataType: "xml",
		success: function (data) {
			$(data).find("item").each(function () { // or "item" or whatever suits your feed
				//Get The Events.  Grab Title + Date Range
				var singleEvent = $(this);
				var title = singleEvent.find("title").text();
				var dateRange = singleEvent.find("field_event_date_range").text();
				
				//Parse Date Range into first date, second date
				var beginnningDate = dateRange.slice(0,10);
				var endingDate= dateRange.slice(19,29);
				
				//grab times from first date, second date
				var eventStartTime = dateRange.slice(11,16);
				var eventEndTime = dateRange.slice(30,35);
				
				//is single day event
				var isOneDay = (beginnningDate==endingDate ? true : false);				
				
				//determine if today is between first date, second date.  If so, change date to "Today"
				var todaysDate = new Date(0);	
				todaysDate.setHours(0,0,0,0);	
				
				//Determine if event is happening today
				var isToday = false;
				var today_date = new Date();
				var month = (today_date.getMonth()+1 > 9) ? today_date.getMonth()+1 : '0'+(today_date.getMonth()+1);
				var day = (today_date.getDay() > 9) ? today_date.getDay : '0'+(today_date.getDay());				
				var td = today_date.getFullYear()+'-'+ month + '-'+ day;
				if ((new Date(beginnningDate)).setHours(0,0,0,0) <= (new Date(td)).setHours(0,0,0,0) && 
				                      (new Date(td)).setHours(0,0,0,0) <= (new Date(endingDate)).setHours(0,0,0,0)) 
					isToday=true;
				
				//0's and ampm's
				var startHour = (eventStartTime.slice(0,2) > 12) ? eventStartTime.slice(0,2) - 12 : eventStartTime.slice(0,2);  // get hours
				var endHour = (eventEndTime.slice(0,2) > 12) ? eventEndTime.slice(0,2) - 12 : eventEndTime.slice(0,2);  // get hours
				var startam_pm = (eventStartTime.slice(0,2) > 12) ? " P.M." : " A.M.";  // get AM/PM
				var endam_pm = (eventStartTime.slice(0,2) > 12) ? " P.M." : " A.M.";  // get AM/PM
				eventStartTime = startHour+eventStartTime.slice(2,5)+startam_pm;
				eventEndTime =   endHour  +eventEndTime.slice(2,5)+endam_pm;
				

				displayEvents(isToday, isOneDay, beginnningDate.slice(5,10).replace('-','/'), endingDate.slice(5,10).replace('-','/'), eventStartTime, eventEndTime,title);
				})
			}
		})
}
			


function getWeather() {
	var lastWeather = localStorage.getItem('lastWeather');
	
	if (lastWeather && Date.now() < lastWeather) {
		console.log('dont need weather yet')
		displayWeather(JSON.parse(localStorage.getItem('weatherJson')))
		return
	}
		
	$.get("https://api.openweathermap.org/data/2.5/forecast?id=5018739&units=imperial&appid=9b553bddc8f2890875e0441f19e28e46",function(r) {
		weatherGrabbed = new Date();
		localStorage.setItem('lastWeather', weatherGrabbed.setMinutes(weatherGrabbed.getMinutes() + 30))
		localStorage.setItem('weatherJson', JSON.stringify(r))
		displayWeather(r)
	},"json");
}

function displayEvents(isToday, isOneDay, beginningDate, endingDate, eventStartTime, eventEndTime,title){
	
		var output = '<div class="weather_box">';
			output += '<div class="day">'+title+'</div>';
			if (isToday){
				output += '<span class="temp high">TODAY!</span><br/>';
			} else if (isOneDay){
				output += '<span class="temp high">'+beginningDate+'</span><br/>';
			} else output += '<span class="temp high">'+beginningDate+'-'+endingDate+'</span><br/>';
			output += '<span class="temp high">'+eventStartTime+'-'+eventEndTime+'</span>';
			output += '</div>';
			$('#weather_container').append(output);
}

function displayWeather(r) {
	$('.weather_box').remove();
	var totalDays = 0
	var lastDay,currentDay,highTemp,icon
	for (var t in r.list) {
		if (totalDays >= 5) break
		item = r.list[t]
		dateTime = item.dt_txt.split(' ')
		currentDay = dateTime[0]
		if (!lastDay) lastDay = currentDay
		if (dateTime[1] == "12:00:00") icon = item.weather[0].icon
		if (lastDay != currentDay) {
			split_date = lastDay.split('-');
			totalDays++
			var day = new Date(split_date[0],split_date[1]-1,split_date[2]);
			var output = '<div class="weather_box">';
			output += '<div class="day">'+(totalDays==1 ? "Today" : day_txt[day.getDay()] )+'</div>';
			output += '<span class="temp high">'+Math.ceil((highTemp ? highTemp : item.main.temp_max))+'<sup><span class="deg">&deg;</span>F</sup></span>';
			output += '<img src="icons/new/wthr-'+(icon ? icon : item.weather[0].icon)+'.png">';
			output += '</div>';
			$('#weather_container').append(output);
			highTemp = null			
			icon = null			
		}
		highTemp = (!highTemp || highTemp < item.main.temp_max ? item.main.temp_max : highTemp)
		
		lastDay = currentDay
	}	
}

function getDate() {
	var today_date = new Date();
	$('#date_container').html('<span>'+day_txt[today_date.getDay()]+' '+month_txt[today_date.getMonth()]+' '+today_date.getDate()+', '+today_date.getFullYear()+'</span>');
}
function getTime() {
	var today_date = new Date();
	var getHours = today_date.getHours() + hourAdjust;
	var hour = (getHours > 12) ? getHours - 12 : getHours;  // get hours
	var minutes = (today_date.getMinutes().toString().length == 1) ? "0"+today_date.getMinutes().toString() : today_date.getMinutes();  // get hours
	var am_pm = (getHours >= 12) ? " P.M." : " A.M.";  // get AM/PM
	$('#time_container').html('<span class="inner">'+hour+':'+minutes+'<span class="ampm">'+am_pm+'</span></span>');
}
//getWeather();
getEvents();
getDate();
setInterval(function(){
	getEvents();
	},12600);

// setInterval(function(){
// 	getWeather();
// },30000*60);
function startTime() {
	setInterval(function(){
		getTime();
	},400*60);
}
setInterval(function(){
	getDate();
},21600);

$.get("https://api.worldweatheronline.com/premium/v1/tz.ashx?q="+wwo_zip_code+"&key="+wwo_tz_api_key+"&format=json&date=today",function(r) {
	var today_dtime = new Date(r.data.time_zone[0].localtime);
	var local_date = new Date();
	var hoursDiff = (today_dtime - local_date) / 36e5;
	if (hoursDiff > .80) {
		console.log('adjustment +1');
		hourAdjust = 1;
	} else if (hoursDiff < -.80) {
		console.log('adjustment -1');
		hourAdjust = -1;
	}
	getTime();
	startTime();
}).fail(function(){
	getTime();
	startTime();
});

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}