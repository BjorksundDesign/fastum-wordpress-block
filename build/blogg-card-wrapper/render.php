<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */
?>
<p <?php echo get_block_wrapper_attributes(); ?>>
	<h2 class="heading"><?php echo esc_html($attributes["headingText"]) ?></h2>
	<p class="bodyText"><?php echo esc_html($attributes["bodyText"]) ?></p>
	<?php echo wp_get_attachment_image($attributes['image'])?>
</p>
