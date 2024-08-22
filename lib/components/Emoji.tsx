import { useEffect } from 'react';
import { EmojiProps, generateEmojiStyle } from '@/utils';
import { useEmojiAnimation, useEmojiStyle } from '@/hooks';
import styles from './Emoji.module.css';

/**
 * Emoji component for displaying animated emojis.
 * @param {EmojiProps} props - The properties for the Emoji component.
 * @param {string} props.id - The unique identifier of the emoji.
 * @param {number} [props.size=100] - The size of the emoji in pixels.
 * @param {boolean} [props.playOnHover=false] - Whether to play the animation on hover.
 * @param {number|'infinite'} [props.animationIterations=2] - The number of times to play the animation, or 'infinite'.
 * @param {boolean} [props.autoPlay=true] - Whether to automatically play the animation on mount.
 * @returns {JSX.Element | null} The rendered Emoji component or null if the emoji is not found.
 */
export const Emoji = ({
	id,
	size = 100,
	playOnHover = false,
	animationIterations = 2,
	autoPlay = true,
}: EmojiProps): JSX.Element | null => {
	const { emoji, categoryFolder } = useEmojiStyle(id);
	const {
		isInitialAnimationComplete,
		animationStyle,
		handleMouseEnter,
		handleMouseLeave,
		imageRef,
	} = useEmojiAnimation(
		emoji,
		playOnHover,
		animationIterations,
		autoPlay,
		size
	);

	// Effect for dynamically adding and removing emoji animation styles
	useEffect(() => {
		if (!emoji) return;

		const styleId = `emoji-style-${id}-${size}`;
		let styleElement = document.getElementById(styleId);

		if (!styleElement) {
			styleElement = document.createElement('style');
			styleElement.id = styleId;
			document.head.appendChild(styleElement);
		}

		// Asynchronously generate and set the emoji style
		generateEmojiStyle(id, size).then((style) => {
			if (styleElement) {
				styleElement.innerHTML = style;
			}
		});

		// Clean up function to remove the style element when component unmounts
		return () => {
			if (styleElement && document.head.contains(styleElement)) {
				document.head.removeChild(styleElement);
			}
		};
	}, [id, size, emoji]);

	// Render nothing if the emoji is not found
	if (!emoji) {
		return null;
	}

	const containerStyle = {
		width: `${size}px`,
		height: `${size}px`,
		display: 'inline-block',
		overflow: 'hidden',
	};
	return (
		<span
			title={emoji.description}
			style={containerStyle}
			className={`${styles.emojiContainer} ${
				isInitialAnimationComplete && playOnHover ? styles.animateOnHover : ''
			}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}>
			<img
				ref={imageRef}
				alt={emoji.description}
				draggable="false"
				src={`https://cdn.animated-fluent-emojis.com/sprites/${categoryFolder}/${id}.png`}
				style={animationStyle}
				className={styles.emojiImage}
			/>
		</span>
	);
};
