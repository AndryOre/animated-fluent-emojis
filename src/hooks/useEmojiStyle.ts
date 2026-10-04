import { useState, useEffect } from 'react';
import {
	emojiManifestPromise,
	getCategoryFolder,
	type EmojiManifest,
} from '../utils/index.js';

export interface UseEmojiStyleResult {
	emoji: EmojiManifest | null;
	categoryFolder: string;
}

/**
 * Custom hook for getting emoji style and category information.
 * @param {string} id - The emoji id.
 * @returns {Object} An object containing the emoji manifest and category folder.
 * @returns {EmojiManifest | null} .emoji - The emoji manifest data or null if not found.
 * @returns {string} .categoryFolder - The category folder for the emoji.
 */
export const useEmojiStyle = (id: string): UseEmojiStyleResult => {
	const [emoji, setEmoji] = useState<EmojiManifest | null>(null);
	const [categoryFolder, setCategoryFolder] = useState<string>('');

	useEffect(() => {
		// Asynchronous function to fetch emoji data
		const fetchEmojiData = async () => {
			try {
				const manifest = await emojiManifestPromise;
				setEmoji(manifest[id] ?? null);
				setCategoryFolder(await getCategoryFolder(id));
			} catch (error) {
				console.error('Error fetching emoji data:', error);
				setEmoji(null);
				setCategoryFolder('');
			}
		};

		fetchEmojiData();
	}, [id]);

	return { emoji, categoryFolder };
};
