import { useState, useRef, useEffect, useMemo } from 'react';
import { EmojiManifest } from '@/utils';

/**
 * Custom hook for managing emoji animation.
 * @param {EmojiManifest | null} emoji - The emoji manifest data or null if not loaded.
 * @param {boolean} playOnHover - Whether to play the animation on hover.
 * @param {number | 'infinite'} animationIterations - The number of animation iterations.
 * @param {boolean} autoPlay - Whether to autoplay the animation.
 * @param {number} size - The size of the emoji in pixels.
 * @returns {Object} An object containing animation-related states and handlers.
 * @returns {boolean} .isInitialAnimationComplete - Whether the initial animation has completed.
 * @returns {React.CSSProperties} .animationStyle - The CSS properties for the animation.
 * @returns {() => void} .handleMouseEnter - Handler for mouse enter event.
 * @returns {() => void} .handleMouseLeave - Handler for mouse leave event.
 * @returns {React.RefObject<HTMLImageElement>} .imageRef - Ref for the image element.
 */
export const useEmojiAnimation = (
	emoji: EmojiManifest | null,
	playOnHover: boolean,
	animationIterations: number | 'infinite',
	autoPlay: boolean,
	size: number
) => {
	const [isInitialAnimationComplete, setIsInitialAnimationComplete] = useState(
		!autoPlay
	);
	const [isHovered, setIsHovered] = useState(false);
	const animationCountRef = useRef(0);
	const imageRef = useRef<HTMLImageElement>(null);

	// Effect for handling animation iterations and completion
	useEffect(() => {
		if (!emoji) return;

		const handleAnimationIteration = () => {
			animationCountRef.current += 1;
			if (
				typeof animationIterations === 'number' &&
				animationCountRef.current >= animationIterations &&
				!isInitialAnimationComplete
			) {
				setIsInitialAnimationComplete(true);
			}
		};

		const handleAnimationEnd = () => {
			if (!isInitialAnimationComplete) {
				setIsInitialAnimationComplete(true);
			}
		};

		const imgElement = imageRef.current;
		if (imgElement) {
			imgElement.addEventListener(
				'animationiteration',
				handleAnimationIteration
			);
			imgElement.addEventListener('animationend', handleAnimationEnd);
		}

		return () => {
			if (imgElement) {
				imgElement.removeEventListener(
					'animationiteration',
					handleAnimationIteration
				);
				imgElement.removeEventListener('animationend', handleAnimationEnd);
			}
		};
	}, [emoji, animationIterations, isInitialAnimationComplete]);

	// Effect for handling play on hover functionality
	useEffect(() => {
		if (!playOnHover || !isInitialAnimationComplete || !emoji) return;

		const imgElement = imageRef.current;
		if (imgElement) {
			if (isHovered) {
				imgElement.style.animationPlayState = 'running';
			} else {
				imgElement.style.animationPlayState = 'paused';
				imgElement.style.transform = `translateY(-${
					(emoji.animation.firstFrame - 1) * size
				}px)`;
			}
		}
	}, [isHovered, playOnHover, isInitialAnimationComplete, emoji, size]);

	// Memoized animation style object
	const animationStyle = useMemo<React.CSSProperties>(() => {
		if (!emoji) return {};

		return {
			width: size,
			animationName: `emoji-${emoji.id}-${size}`,
			animationDuration: `${
				emoji.animation.framesCount / emoji.animation.fps
			}s`,
			animationTimingFunction: `steps(${emoji.animation.framesCount})`,
			animationIterationCount:
				isInitialAnimationComplete && playOnHover
					? 'infinite'
					: animationIterations,
			animationPlayState:
				(autoPlay && !isInitialAnimationComplete) ||
				(isInitialAnimationComplete && playOnHover && isHovered)
					? 'running'
					: 'paused',
			transform: `translateY(-${(emoji.animation.firstFrame - 1) * size}px)`,
		};
	}, [
		emoji,
		size,
		isInitialAnimationComplete,
		playOnHover,
		animationIterations,
		autoPlay,
		isHovered,
	]);

	const handleMouseEnter = () => setIsHovered(true);
	const handleMouseLeave = () => setIsHovered(false);

	return {
		isInitialAnimationComplete,
		animationStyle,
		handleMouseEnter,
		handleMouseLeave,
		imageRef,
	};
};
