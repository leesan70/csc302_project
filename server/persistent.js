var style = `
	body {
		margin:0;
		font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
	}

	.wrapper {
		background-color:#fff;
	    overflow:hidden;
	    padding-bottom:10px
	}

	p, li {
		font-size:13px;
	}

	.title {
		padding:0px;
		background-color:#3f51b5;
		color:#fff;
		display:flex;
		flex-direction:column;
		text-align:center;
		box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
	}
	.title h2 {
		font-size:22px;
		margin:20px 0;
		text-align:center;
	}

	h1, h2, h3 {
		word-wrap:break-word;
	}

	.content {
	    width: 726px;
	    max-width: 100%;
	    margin-left: auto;
	    margin-right: auto;	
	    padding:0px 16px;
	}

	.lineBreak {
		height:2px;
		background-color:#eee;
		width:100%;
	}

	.answer {
	}

	.section {
		background-color:#eee;
		border-radius:4px;
		padding:5px;
	}
	.section h3 {
		margin:0;
	}
`

function timestampToDate(timestamp) {
	var year = timestamp.substring(0,4)
	var month = timestamp.substring(4,6)
	var day = timestamp.substring(6,8)
	var hour = timestamp.substring(9,11)
	var minute = timestamp.substring(11,13)
	var second = timestamp.substring(13,15)

	var str = `${year}-${month}-${day}T${hour}:${minute}:${second}`
	return new Date(str)
}

/** 
 * Render response
 * @param response SDCFormResponse
 * @param form SDCForm
 * @return string
 */
function renderResponse(req, link, form) {
	var html = `<html><head><style>${style}</style></head><body><div class="wrapper">`

	var lineBreak = () => {
		html += '<div class=lineBreak></div>';
	}
	var response = link.response

	//html += `<h1>${form.title}</h1>`
	var date = new Date(link.timestamp)//timestampToDate(link.timestamp)
	html += `
	<div class="title">
		<h2>${form.title} Form Results</h2>
	</div>`

	var baseUrl = req ? `${req.protocol}://${req.get('Host')}` : '';

	html += `<div class="content">`
	html += `<p> <strong>Persistent Link:</strong> ${baseUrl}/persistent/${link.link}</p>`
	html += `<p> <strong>Date:</strong> ${date.toUTCString()} </p>`
	html += `<p> <strong>Diagnostic Procedure:</strong> ${form.diagnosticProcedureID}</p>`
	html += `<p> <strong>Patient ID:</strong> ${response.patientID}</p>`
	html += `<p> <strong>Form Filler ID:</strong> ${response.formFillerID}</p>`

	lineBreak()

	html += `<h3> Response </h3>`

	var answerMap = {}
	for(let i = 0; i < response.answers.length; i++) {
		answerMap[response.answers[i].nodeID] = response.answers[i]
	}
	var sectionMap = {}
	for(let i = 0; i < form.nodes.length; i++) {
		if(form.nodes[i].referenceID in answerMap) {
			var section = parseInt(form.nodes[i].section)
			sectionMap[section] = 1
		}
	}

	var prevSection = -1
	var count = 0
	for(let i = 0; i < form.nodes.length; i++) {
		var node = form.nodes[i]
		var section = parseInt(node.section)
		if(section != prevSection) {
			if(section in sectionMap && section > 0 && section < form.sections.length) {
				html += '<div class="section"><h3> Section: ' + form.sections[section] + '</h3></div>'
			} 
			prevSection = section
			count = 0;
		}

		if(node.referenceID in answerMap) {
			if(count > 0)
				lineBreak()
			count++

			var answer = answerMap[node.referenceID]
			html += '<div class="answer"> <p><strong>' + node.title + '</strong>: '
			if(answer.field) {
				if(answer.field.stringValue != null) {
					html += answer.field.stringValue
				} else if(answer.field.numberValue != null) {
					html += answer.field.numberValue
				}
			}
			else if(answer.choices != null) {
				var choiceNames = []
				// N^2 check to match up choices
				for(let j = 0; j < node.choices.length; j++) {
					for(let k = 0; k < answer.choices.length; k++) {
						if(node.choices[j].referenceID == answer.choices[k].choiceID) {
							var title = node.choices[j].title
							if(answer.choices[k].field != null)
								title += ': ' + answer.choices[k].field.stringValue + answer.choices[k].field.numberValue
							choiceNames.push(title)
							break
						}
					}
				}
				if(choiceNames.length > 0) {
					html += "<ul>"
					html += choiceNames.map(x => {return `<li>${x}</li>`}).join('')
					html += "</ul>"
				}
			}

			html += '</p></answer>'
		}
	}

	html += '</content></wrapper></body></html>'
	return html
}

export default {
	renderResponse,
	timestampToDate
}