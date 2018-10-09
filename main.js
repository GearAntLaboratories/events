var day_txt = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var month_txt = [ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ];
var wwo_tz_api_key = "1dc62aa250664e5ea6c181443161908";
var wwo_zip_code = "55425";
var hourAdjust = 0;

function getEvents(){
	$('.events_box').remove();
	var feed = "https://moaapi.net/resttest";

	$.ajax(feed, {
		accepts: {
			xml: "application/rss+xml"
		},
		dataType: "xml",
		success: function (data) {
			$(data).find("item").each(function () {
				//if (document.getElementById('events_container').clientHeight>1300) return;  
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
				//Determine if event is happening today
				var isToday = false;
				var today_date = new Date();
				var month = (today_date.getMonth()+1 > 9) ? today_date.getMonth()+1 : '0'+(today_date.getMonth()+1);
				var day = (today_date.getDate() > 9) ? today_date.getDate() : '0'+(today_date.getDate());				
				var td = today_date.getFullYear()+'-'+ month + '-'+ day;
				if ((new Date(beginnningDate)).setHours(0,0,0,0) <= (new Date(td)).setHours(0,0,0,0) && 
				                      (new Date(td)).setHours(0,0,0,0) <= (new Date(endingDate)).setHours(0,0,0,0)) 
					isToday=true;

				//0's and ampm's
				var startam_pm = (eventStartTime.slice(0,2) > 12) ? " P.M." : " A.M.";  // get AM/PM
				var endam_pm = (eventEndTime.slice(0,2) > 12) ? " P.M." : " A.M.";  // get AM/PM
				var startHour = (eventStartTime.slice(0,2) > 12) ? eventStartTime.slice(0,2) - 12 : eventStartTime.slice(0,2);  // get hours
				var endHour = (eventEndTime.slice(0,2) > 12) ? eventEndTime.slice(0,2) - 12 : eventEndTime.slice(0,2);  // get hours
				eventStartTime = startHour+eventStartTime.slice(2,5)+startam_pm;
				eventEndTime =   endHour  +eventEndTime.slice(2,5)+endam_pm;
				
				//Is there an override?
				var override = singleEvent.find("field_date_time_override").text();
				displayEvents(isToday, isOneDay, beginnningDate.slice(5,10).replace('-','/').replace('/0','/'), endingDate.slice(5,10).replace('-','/').replace('/0','/'), eventStartTime, eventEndTime,title, override);
				})
			}
		})
}

function displayEvents(isToday, isOneDay, beginningDate, endingDate, eventStartTime, eventEndTime,title, override){
	
		var output = '<div class="events_box">';
			output += '<div class="day">'+title+'</div>';
			if (override!=""){
				output += '<span class="temp high">'+override+'</span><br/>';
			} else{
					if (isToday){
					output += '<span class="temp high">TODAY!</span><br/>';
				} else if (isOneDay){
					output += '<span class="temp high">'+beginningDate+'</span><br/>';
				} else output += '<span class="temp high">'+beginningDate+'-'+endingDate+'</span><br/>';
				output += '<span class="temp high">'+eventStartTime+'-'+eventEndTime+'</span>'; 
			}
			output += '</div>';
			$('#events_container').append(output);
}

function getDate() {
	var today_date = new Date();
	$('#date_container').html('<span>'+day_txt[today_date.getDay()]+' '+month_txt[today_date.getMonth()]+' '+today_date.getDate()+', '+today_date.getFullYear()+'</span>');
	$('#blackbox').html('<span></span>');
}
function getTime() {
	var today_date = new Date();
	var getHours = today_date.getHours() + hourAdjust;
	var hour = (getHours > 12) ? getHours - 12 : getHours;  // get hours
	var minutes = (today_date.getMinutes().toString().length == 1) ? "0"+today_date.getMinutes().toString() : today_date.getMinutes();  // get hours
	var am_pm = (getHours >= 12) ? " P.M." : " A.M.";  // get AM/PM
	$('#time_container').html('<span class="inner">'+hour+':'+minutes+'<span class="ampm">'+am_pm+'</span></span>');
}
getEvents();
getDate();
setInterval(function(){
	getEvents();
	},126000);

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