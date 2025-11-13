<?php
/**
 * Plugin Name:       Fastum Block
 * Plugin URI:        https://github.com/BjorksundDesign/fastum-wordpress-block
 * Description:       Block for Fastum public web.
 * Version:           1.1.4
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            Thomas Björksund
 * Author URI:      	http://www.thomasbjorksund.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       custom-text-block
 * GitHub Plugin URI: https://github.com/BjorksundDesign/fastum-wordpress-block
 * Primary Branch:    main
 *
 * @package CustomTextBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Optional local debug toggle
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', true );
    define( 'WP_DEBUG_LOG', __DIR__ . '/plugin-debug.log' );
	define( 'WP_DEBUG_DISPLAY', false );
}

/**
 * Register all custom blocks from /build.
 */
function custom_text_block_init() {

	if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection(
			__DIR__ . '/build',
			__DIR__ . '/build/blocks-manifest.php'
		);
		return;
	}

	if ( function_exists( 'wp_register_block_metadata_collection' ) ) {
		wp_register_block_metadata_collection(
			__DIR__ . '/build',
			__DIR__ . '/build/blocks-manifest.php'
		);
	}

	$manifest_data = require __DIR__ . '/build/blocks-manifest.php';
	foreach ( array_keys( $manifest_data ) as $block_type ) {
		register_block_type( __DIR__ . "/build/{$block_type}" );
	}
}
add_action( 'init', 'custom_text_block_init' );

/**
 * Enqueue editor and frontend styles.
 */
function custom_blocks_enqueue_assets() {
	$components = ['card-modal', 'faq-modal','hero-modal', 'text-modal'];

	foreach ( $components as $component ) {
		wp_enqueue_style(
			"custom-text-block-{$component}-style",
			plugins_url( "{$component}/style.css", __FILE__ ),
			[],
			'1.0.0'
		);
	}

	wp_enqueue_style(
		'custom-text-block-global-style',
		plugins_url( 'src/styles/css/global.css', __FILE__ ),
		[],
		'1.0.0'
	);
}
add_action( 'enqueue_block_editor_assets', 'custom_blocks_enqueue_assets' );
add_action( 'wp_enqueue_scripts', 'custom_blocks_enqueue_assets' );

/**
 * Enable Markdown support for Yoast SEO (optional).
 */
add_filter( 'wpseo_is_markdown_enabled', '__return_true' );
