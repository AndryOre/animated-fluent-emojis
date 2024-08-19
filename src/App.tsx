import './App.css';
import { Emoji } from '../lib';

function App() {
	return (
		<>
			<h1>Animated Fluent Emojis</h1>
			<div className="emoji-grid">
				<div className="emoji-card">
					<div className="emoji-card-body">
						<div className="emoji-display">
							<Emoji id="surprised" />
						</div>
						<span className="emoji-props">Default</span>
					</div>
				</div>

				<div className="emoji-card">
					<div className="emoji-card-body">
						<div className="emoji-display">
							<Emoji id="surprised" autoPlay={false} />
						</div>
						<span className="emoji-props">autoPlay=&#123;false&#125;</span>
					</div>
				</div>

				<div className="emoji-card">
					<div className="emoji-card-body">
						<div className="emoji-display">
							<Emoji id="surprised" size={50} />
						</div>
						<span className="emoji-props">size=&#123;50&#125;</span>
					</div>
				</div>

				<div className="emoji-card">
					<div className="emoji-card-body">
						<div className="emoji-display">
							<Emoji id="surprised" size={150} />
						</div>
						<span className="emoji-props">size=&#123;150&#125;</span>
					</div>
				</div>

				<div className="emoji-card">
					<div className="emoji-card-body">
						<div className="emoji-display">
							<Emoji id="surprised" playOnHover />
						</div>
						<span className="emoji-props">playOnHover</span>
					</div>
				</div>

				<div className="emoji-card">
					<div className="emoji-card-body">
						<div className="emoji-display">
							<Emoji id="surprised" animationIterations={5} />
						</div>
						<span className="emoji-props">
							animationIterations=&#123;5&#125;
						</span>
					</div>
				</div>

				<div className="emoji-card">
					<div className="emoji-card-body">
						<div className="emoji-display">
							<Emoji id="surprised" animationIterations="infinite" />
						</div>
						<span className="emoji-props">animationIterations="infinite"</span>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
