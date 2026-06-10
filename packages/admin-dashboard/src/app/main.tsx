import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app.js';
import './styles.css';

const rootElement = document.getElementById('app') as HTMLDivElement;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
}
