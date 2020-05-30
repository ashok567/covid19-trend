/* exported divideTicks */
/* global draw_pie, draw_bar, draw_map, draw_sparkline */

var state_data = []
var table_tmplt = _.template($('#state-table').html());
var pie_tmplt = _.template($('#pie-script').html());
var bar_tmplt = _.template($('#bar-script').html());

function initialize(){
  console.log(performance.navigation.type)
  if(performance.navigation.type==0){
    $('#modal-info').modal('show')
  }
  $.get('/state_wise', function(res){
    var overview_tmplt = _.template($('#overview-sc').html());
    var total_count = res.response[0]
    var overview_html = overview_tmplt({ overview: total_count});
    $('#overview').html(overview_html);
    state_data = _.filter(res.response.splice(1), (d)=>d.State!='State Unassigned')
    state_data = _.orderBy(state_data, ['Confirmed'], ['desc'])
    $('.loader').fadeOut('slow')
    $('.wrapper').removeClass('d-none')
    d3.select('body').transition().duration(1000)
    draw_map(state_data, 'Confirmed')
    renderSparkLine()
    renderTable(state_data)
    renderPie()
    renderBar()
    var last_update_time = total_count['Last_Updated_Time']
    $('.credits').text(`Last updated on ${last_update_time}`)
  })
}

function renderTable(data){
  $('.states').empty()
  var table_html = table_tmplt({ table_data: data, max_data: data[0] });
  $('.states').html(table_html);
}

function renderPie(){
  $('#pie-section').empty()
  var pie_html = pie_tmplt();
  $('#pie-section').html(pie_html);
  $.get('/pie', function(res){
    res = res.response
    var pie_data1 = _.pick(res, ['Positive', 'Negative', 'Unconfirmed'])
    var pie_data2 = _.pick(res, ['Total People Currently in Quarantine', 'Total People Released From Quarantine'])
    draw_pie(pie_data1, '#pie_div1')
    draw_pie(pie_data2, '#pie_div2')
  })
}

function renderBar(){
  $('#bar-section').empty()
  var bar_html = bar_tmplt();
  $('#bar-section').html(bar_html);
  $.get('/time_series', function(res){
    res = res.response
    var dataset = _.map(res, (d)=> _.pick(d, ['Month', 'Total Tested', 'Daily Confirmed', 'Daily Recovered', 'Daily Deceased']))
    draw_bar(dataset)
  })
}

function renderSparkLine(){
  $.get('/trendline', function(res){
    res = res.response
    var data_class = {'Daily Confirmed': '#confirmed-spark',
    'Daily Active': '#active-spark',
    'Daily Recovered': '#recovered-spark',
    'Daily Deceased': '#fatal-spark'}
    _.each(data_class, function(ele, col){
      var dataset = _.map(res, (d)=> _.pick(d, ['Date', col]))
      draw_sparkline(dataset, ele)
    })
  })
}

function divideTicks(min, max, ticks) {
  var result = []
  var delta = 0
  delta = (max - min) / (ticks - 1);
  var i = 0
  while (i <= ticks - 1) {
    result.push(parseInt(min));
    min += delta;
    i++
  }
  return result
}

$(document).ready(function(){
  $('.loader').show()
  initialize()
})

$('body')
.on('click', '.map-click', function(){
  var selected_id = $(this).attr('id')
  var map_state_data = _.orderBy(state_data, [selected_id], ['desc'])
  draw_map(map_state_data, selected_id)
})
.tooltip({
  selector: '.map-slice, .barline-slice',
  container: 'body',
  html: true,
  animated: 'fade'
});
