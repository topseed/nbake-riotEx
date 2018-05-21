
riot.tag2('feed-tag', '<a> <div class="ui fluid blue card"> <div class="image"><img></div> <div class="content"> <div class="header">{title}</div> <div class="meta">{created}</div> <div class="description">{content_html}</div> </div> <div class="extra content"> <h5 class="ui image header"><img class="ui avatar image" riot-src="{}"> <div class="content">{author.name} <div class="sub header">{read_minutes} minute read</div> </div> </h5> </div> </div></a> <p></p>', '', '', function(opts) {
    function init() {
    	loadjs.ready(['feed'], function () {
    		console.log('sz', feed.items.length)
    		addFew(2)
    		setTimeout(function(){
    			loadjs.done('firstPg')
    		},1000/60)
    	})

    	loadjs.ready(['style','firstPg'], function () {

    		const addEl = document.getElementById('add')
    		let observer = new IntersectionObserver(function(e){
    			if(e[0].isIntersecting) {
    				console.log('I can see the end')

    			}
    		})
    		observer.observe(addEl)
    	})
    }

    this.addFew = function(c) {
    	let $t = $('<div></div>')
    	while(c>0) {
    		$t = _addOne($t )
    		c--
    	}
    	$('#here').append( $t )
    	console.log('done binding')
    }.bind(this)

    cur = 0

    this._addOne = function($t) {
    	let sz = feed.items.length
    	if(--sz < cur ) {
    		console.log(feed.items.length, cur)
    		console.log('the end')
    		return $t
    	}
    	let item =  $.extend({}, feed.items[cur++] )
    	item.url = '/blog/' + item.url +'/'
    	item.image =  item.url + item.image
    	console.log(item.image)

    	var el = feedDBind(item)
    	$t.append(el)
    	return $t
    }.bind(this)
});