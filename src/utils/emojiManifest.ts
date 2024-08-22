import { Manifest, EmojiManifest } from '@/utils';

/**
 * Fetches the emoji manifest from the CDN.
 * @returns {Promise<Manifest>} A promise that resolves to the raw manifest data.
 */
async function fetchManifest(): Promise<Manifest> {
	const response = await fetch(
		'https://cdn.animated-fluent-emojis.com/manifest.json'
	);
	return response.json();
}

/**
 * Generates the emoji manifest from the raw manifest data.
 * @returns {Promise<Record<string, EmojiManifest>>} A promise that resolves to the processed emoji manifest.
 */
export async function generateEmojiManifest(): Promise<
	Record<string, EmojiManifest>
> {
	const rawManifest = await fetchManifest();
	// Reduce the raw manifest into a flat object with emoji id as key
	return rawManifest.categories.reduce(
		(acc, category) => ({
			...acc,
			...Object.fromEntries(
				category.emoticons.map((emoticon) => [
					emoticon.id,
					{ ...emoticon, category: category.title },
				])
			),
		}),
		{}
	);
}

/**
 * A promise that resolves to the processed emoji manifest.
 */
export const emojiManifestPromise = generateEmojiManifest();

/**
 * Gets the category folder for a given emoji id.
 * @param {string} id - The emoji id.
 * @returns {Promise<string>} A promise that resolves to the category folder name.
 * @throws {Error} If the emoji is not found.
 */
export async function getCategoryFolder(id: string): Promise<string> {
	const manifest = await emojiManifestPromise;
	const emoji = manifest[id];
	if (!emoji) throw new Error(`Emoji with id "${id}" not found`);
	return emoji.category;
}

/**
 * Generates the keyframe animation CSS for a specific emoji and size.
 * @param {string} id - The emoji id.
 * @param {number} size - The size of the emoji in pixels.
 * @returns {Promise<string>} A promise that resolves to the generated CSS string.
 * @throws {Error} If the emoji is not found.
 */
export async function generateEmojiStyle(
	id: string,
	size: number
): Promise<string> {
	const manifest = await emojiManifestPromise;
	const emoji = manifest[id];
	if (!emoji) throw new Error(`Emoji with id "${id}" not found`);

	return `
    @keyframes emoji-${id}-${size} {
      0% { transform: translateY(0); }
      100% { transform: translateY(-${emoji.animation.framesCount * size}px); }
    }
  `;
}
