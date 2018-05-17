// ts router generic //////////////////////////////////////////////////////////////////////////////
loadjs.ready('site', function () {

	console.log('ts router', "v3.05.01")

	$(window).on('popstate', function(e) {//back/forward button
		console.log('tsrouter popstate'+e.originalEvent.state)
		let state = e.originalEvent.state
		if (state !== null) {
			e.preventDefault()
			let oldUrl = localStorage.getItem('oldUrl')
			localStorage.setItem('oldUrl', state.url)
			tsrouter.loadHtml(state.url, oldUrl, true)
		}
	})

	$(document).on('click', 'a', function(e) { //override links
		let anchor = $(e.currentTarget)
		let href = anchor.prop('href')
		if (! href || href.length < 1) {
			return
		}
		if (anchor.is('.norouter'))
			return
		if (tsrouter.isExternal(href)) {
			return
		}

		//else:
		e.preventDefault()
		let fromHref = window.location.href
		localStorage.setItem('oldUrl', href)
		tsrouter.loadHtml(href, fromHref)
	})

	let pg = window.location.href
	history.pushState({url: pg}, '', pg)
	localStorage.setItem('oldUrl', pg)
})

let tsrouter = {

	zone: '#ss' //the content in your layout. The rest should be app shell from PWA.
	, NAV : '_navigation-start'
	, PAGE : '_newpage-loaded'
	, navigated: new signals.Signal()

	, onNavigate : function(foo) {
		tsrouter.navigated.add(foo)
	}

	, loadHtml: function(toHref, fromHref, back) { //triggered, but function can be called directly also
		console.log('loaded', toHref)
		if (!back) {
			history.pushState({url: toHref}, '', toHref)
		}

		//fire NAV event
		tsrouter.navigated.dispatch( {type:tsrouter.NAV, toHref:toHref, fromHref:fromHref, back:back} )

		let url = tsrouter.appendQueryString(toHref, {'tsrouter': "\""+tsrouter.zone+"\""} )
		console.log(url)
		fetch(url, {
				method: 'get',
				credentials: 'same-origin'
			}).then(function(response) {
				if (!response.ok) {
					console.log('not ok')
					console.log(response)
					throw Error(response.statusText)
				}
				return response.text()
			}).then(function(txt) {
				let $html = $( '<html></html>' ).append( $(txt) )
				let title = $html.find('title').first().text()
				document.title = title

				let newContent = $html.find(tsrouter.zone).html()
				//console.log(newContent)

				//fire new PAGE received event
				tsrouter.navigated.dispatch( {type:tsrouter.PAGE, toHref:toHref, fromHref:fromHref, newContent:newContent, $html:$html, back:back} )

			}).catch(function(er) {
				console.log(er)
				tsrouter.navigated.dispatch({type:tsrouter.ERR, err:er})
		})
	}

	, isExternal: function(url) {// copied from original SS
		let match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/)
		if (typeof match[1] === 'string' && match[1].length > 0 && match[1].toLowerCase() !== window.location.protocol) {
			return true
		}
		if (typeof match[2] === 'string' &&
			match[2].length > 0 &&
			match[2].replace(new RegExp(':(' + {'http:': 80, 'https:': 443}[window.location.protocol] +
			')?$'), '') !== window.location.host) {
			return true
		}
		return false
	}

	, appendQueryString:function (url, queryVars) {
		let firstSeparator = (url.indexOf('?')==-1 ? '?' : '&')
		let queryStringParts = new Array()
		for(let key in queryVars) {
			queryStringParts.push(key + '=' + queryVars[key])
		}
		let queryString = queryStringParts.join('&')
		return url + firstSeparator + queryString;
	}
}

// /////////////////////////////////////////////////////////////////////////////////////

//  use:

loadjs.ready('site', function(){
	console.log('setup tsr')
	tsrouter.zone = '.pusher'
	tsrouter.onNavigate(function(evt) {
		if (evt.type == tsrouter.NAV)  { //start
			console.log('tsrouter NAV')
			//$('#content-wrapper').fadeTo(100,.2)
		}
		else if (evt.type == tsrouter.PAGE)  {
			console.log('tsrouter PAGE')
			$(tsrouter.zone).html(evt.newContent)
			//$('#content-wrapper').fadeTo(100,1)
			window.scrollTo(0, 0)
		}
	})
})