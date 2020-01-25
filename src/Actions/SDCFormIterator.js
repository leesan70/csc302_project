/**
 * Create a new iterator from the given data 
 * @param data, contains {json, model, xml} for testing purposes
 * @return SDCFormIterator
 */
export function createFromData(data) {
	console.log("CreateFromData", data);
	return new Promise((resolve) => {
		// Raw form data within data.json
		var form = data.form

		var nodeMap = {}
		for(let i = 0; i < form.nodes.length; i++) {
			if("referenceID" in form.nodes[i]) {
				nodeMap[form.nodes[i].referenceID] = i
			} else {
				console.log("Node " + i + " missing ref id")
			}
		}

		var currentNode = -1 
		var dependencyStack = []
		// For a diven dependency option, determine if its deeper or not
		var handleDependency = (dependency) => {
			// Check that depedency is met
			// If its not, recall next() and return
			var parent = ""
			if(dependencyStack.length > 0)
				parent = dependencyStack[dependencyStack.length-1]

			// TODO: what about the last item? should hasNext consider this?
			if(dependency != parent) {
				// Check if we're going back in depedency
				var deeper = true;
				for(let i = 0; i < dependencyStack.length; i++) {
					if(dependencyStack[i] == dependency) {
						dependencyStack.slice(0, i+1)
						deeper = false
						break
					}
				}
				if(deeper)
					dependencyStack.push(dependency)
			}	
		}

		// Are we at the end of the form
		var hasNext = () => {

			if(currentNode + 1 < form.nodes.length-1) {
				// TODO: Make sure next dependency is met
				return true
			} else {
				return false;
			}
		}

		// Get the next node in the form
		var next = () => {
			currentNode++
			// Maybe strip the node of irrelevant info?
			var node = form.nodes[currentNode];

			if("dependency" in node) {
				handleDependency()
			} else {
				dependencyStack = []
			}

			var strippedNode ={
				title:node.title,
				list:node.list,
				response:node.response,
				depth:dependencyStack.length
			}

			var it = {node: strippedNode}

			// Indicator for new section
			if(currentNode == 0 || (currentNode > 0 && form.nodes[currentNode-1].section != form.nodes[currentNode].section))
				it.section = form.sections[form.nodes[currentNode].section]
			return it
		}

		resolve({
			hasNext:hasNext,
			next:next,
			title:form.title
		})
	})
}

export const SDCFormIterator = {
	createFromData,
};