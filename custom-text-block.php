<?php
/**
 * Plugin Name:       Fastum Block
 * Plugin URI:        https://github.com/BjorksundDesign/fastum-wordpress-block
 * Description:       Block for Fastum public web.
 * Version:           1.5.4
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            Thomas Björksund
 * Author URI:        http://www.thomasbjorksund.com
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

add_action('wp_enqueue_scripts', function() {

	wp_enqueue_style(
		'fastum-global',
		plugin_dir_url(__FILE__) . 'src/styles/css/global.css',
		[],
		filemtime(plugin_dir_path(__FILE__) . 'src/styles/css/global.css')
	);

});
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

}
add_action( 'enqueue_block_editor_assets', 'custom_blocks_enqueue_assets' );
add_action( 'wp_enqueue_scripts', 'custom_blocks_enqueue_assets' );

/**
 * Enable Markdown support for Yoast SEO (optional).
 */
add_filter( 'wpseo_is_markdown_enabled', '__return_true' );

add_filter('wpseo_pre_analysis_post_content', function($content) {

    $blocks = parse_blocks($content);

    foreach ($blocks as $block) {
        if ($block['blockName'] === 'custom-text-block/card-modal') {
            $content .= render_block($block);
        }
    }

    return $content;
});

add_action('wp_head', function() {

    $font_path = plugins_url('src/fonts/fa-solid-900.woff2', __FILE__);

    echo '<link rel="preload" href="' . esc_url($font_path) . '" as="font" type="font/woff2" crossorigin>';

});

add_action('wp_head', function () {
    echo '<link rel="preload" href="' . includes_url('fonts/dashicons.woff2') . '" as="font" type="font/woff2" crossorigin>';
}, 1);

// add_action('wp_enqueue_scripts', function() {

//     if (!is_admin()) {
//         wp_deregister_script('jquery');
//         wp_deregister_script('jquery-migrate');
//     }

// }, 100);