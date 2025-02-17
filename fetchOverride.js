(() => {
	const { fetch: originalFetch } = window;

	window.fetch = async (...args) => {
		let [resource, config] = args;
		const response = await originalFetch(resource, config);

		const clone = response.clone();		
		const meetingDisplayName = g_fileInfo.displayName;
		const meetingDuration = Math.round(JSON.parse(g_fileInfo.MediaServiceFastMetadata).media.duration/1e7/60) + ' minute(s)';
		
		if (resource.includes('streamContent')) {
					clone.json()
						.then((data) => {
							const hiddenDiv = document.createElement('div')
							hiddenDiv.style.display = 'none';
							hiddenDiv.id = 'transcript-extractor-for-microsoft-stream-hidden-div-with-transcript';

							// Transform transcript entries into formatted text
							const transcriptText = data.entries
							.map(entry => {
								const speakerName = entry.speakerDisplayName;
								const startOffset = (''+entry.startOffset).replace(/\.[0-9]+/, '');
								const endOffset = (''+entry.endOffset).replace(/\.[0-9]+/, '');
								return `${speakerName} (${startOffset} - ${endOffset}):\n${entry.text}\n`;
							})
							.join("\n"); // Adds a blank line between entries

							hiddenDiv.innerHTML = 
							'------------\n' + 
							meetingDisplayName + ` (${meetingDuration})\n` +
							'------------\n\n' + 
							transcriptText;

							window.document.body.appendChild(hiddenDiv);
						})
						.catch((err) => console.error(err));
				}

				return response;
	};
})();
