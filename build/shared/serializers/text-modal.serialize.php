<?php
// shared/serializers/text-modal-serialize.php

if ( ! function_exists( 'tm_aspect_to_css' ) ) {
	function tm_aspect_to_css( $val ) {
		if ( empty( $val ) || $val === 'none' ) return '';
		if ( $val === '3/2' ) return '3 / 2';
		if ( $val === '2/3' ) return '2 / 3';
		return preg_replace( '/[^0-9\s\/\.\:]/', '', $val );
	}
}

if ( ! function_exists( 'tm_resolve_heading_tag' ) ) {
	function tm_resolve_heading_tag( $item ) {
		$size = isset( $item['size'] ) ? (string) $item['size'] : '';
		$tag  = isset( $item['headingType'] ) ? strtolower( (string) $item['headingType'] ) : (
			$size === 'xl' ? 'h1' : ( $size === 'l' ? 'h2' : ( $size === 'm' ? 'h3' : 'h4' ) )
		);
		return in_array( $tag, array( 'h1','h2','h3','h4','h5','h6' ), true ) ? $tag : 'h3';
	}
}

if ( ! function_exists( 'tm_render_item' ) ) {
	function tm_render_item( $item ) {
		if ( ! is_array( $item ) || empty( $item['type'] ) ) return '';

		switch ( $item['type'] ) {
			case 'heading': {
				$tag   = tm_resolve_heading_tag( $item );
				$text  = isset( $item['text'] ) ? (string) $item['text'] : '';
				$class = 'heading' . ( ! empty( $item['size'] ) ? ' ' . sanitize_html_class( $item['size'] ) : '' );
				if ( $text === '' ) return '';
				return sprintf( '<%1$s class="%2$s">%3$s</%1$s>', $tag, esc_attr( $class ), esc_html( $text ) );
			}

			case 'paragraph': {
				$text = isset( $item['text'] ) ? (string) $item['text'] : '';
				return $text === '' ? '' : '<p class="paragraph">' . esc_html( $text ) . '</p>';
			}

			case 'list': {
				$list = isset( $item['list'] ) && is_array( $item['list'] ) ? $item['list'] : array();
				if ( empty( $list ) ) return '';
				$li_style = array(
					'--faIcon:'   . ( isset( $item['icon'] ) ? $item['icon'] : '"\\f00c"' ),
					'--iconColor:'. ( isset( $item['iconColor'] ) ? $item['iconColor'] : '#000000' ),
				);
				$out = '<ul class="text-modal-ul">';
				foreach ( $list as $i => $li ) {
					$out .= '<li class="list" style="' . esc_attr( implode( ';', $li_style ) ) . '"><span>' . esc_html( (string) $li ) . '</span></li>';
				}
				$out .= '</ul>';
				return $out;
			}

			case 'button': {
				$text      = isset( $item['text'] ) ? (string) $item['text'] : '';
				if ( $text === '' ) return '';
				$href      = isset( $item['url'] ) ? (string) $item['url'] : '#';
				$isPrimary = ! empty( $item['isPrimary'] );
				$openInNew = ! empty( $item['openInNew'] );

				$classes = trim( 'wp-block-button__link ' . ( $isPrimary ? 'button-primary' : 'button-secondary' ) . ' wp-block-button fastum-button' );
				$attrs = array( 'class' => $classes, 'href' => $href );
				if ( $openInNew ) { $attrs['target'] = '_blank'; $attrs['rel'] = 'noopener'; }
				$attr_str = '';
				foreach ( $attrs as $k => $v ) $attr_str .= ' ' . $k . '="' . esc_attr( $v ) . '"';

				return '<p class="btn-wrap"><a' . $attr_str . '>' . esc_html( $text ) . '</a></p>';
			}

			case 'image': {
				$img = isset( $item['image'] ) ? $item['image'] : null;

				// Om vi har ett objekt med url/alt/caption -> rendera direkt
				if ( is_array( $img ) && ( ! empty( $img['url'] ) || ! empty( $img['src'] ) ) ) {
					$url = ! empty( $img['url'] ) ? $img['url'] : $img['src'];
					$alt = isset( $img['alt'] ) ? (string) $img['alt'] : '';
					$cap = isset( $img['caption'] ) ? (string) $img['caption'] : '';
					$out  = '<figure class="image"><img src="' . esc_url( $url ) . '" alt="' . esc_attr( $alt ) . '" />';
					if ( $cap !== '' ) $out .= '<figcaption>' . esc_html( $cap ) . '</figcaption>';
					$out .= '</figure>';
					return $out;
				}

				// Om vi bara har ett attachment ID -> slå upp URL på servern
				if ( is_int( $img ) && $img > 0 ) {
					$url = wp_get_attachment_image_url( $img, 'full' ) ?: '';
					$alt = get_post_meta( $img, '_wp_attachment_image_alt', true ) ?: '';
					if ( $url === '' ) return '';
					return '<figure class="image"><img src="' . esc_url( $url ) . '" alt="' . esc_attr( $alt ) . '" /></figure>';
				}

				// Annars inget att rendera
				return '';
			}
		}
		return '';
	}
}

if ( ! function_exists( 'tm_render_items_html' ) ) {
	/**
	 * Returnerar endast INNEHÅLLET (utan wrapper-kolumner).
	 */
	function tm_render_items_html( $items ) {
		$out = '';
		if ( is_array( $items ) ) {
			foreach ( $items as $it ) { $out .= tm_render_item( $it ); }
		}
		return $out;
	}
}

if ( ! function_exists( 'tm_render_layout_html' ) ) {
	/**
	 * Hjälp för block med textkolumn + (valfri) bildkolumn.
	 * $args: items, columnOrder(bool), textAlign, rightImage(array|id), imageWidth, imageSize, imageAspect
	 */
	function tm_render_layout_html( $args = array() ) {
		$defaults = array(
			'items'        => array(),
			'columnOrder'  => false,
			'textAlign'    => 'left',
			'rightImage'   => null, // array {url,alt,caption} eller attachment id
			'imageWidth'   => '',
			'imageSize'    => '',
			'imageAspect'  => '',
		);
		$a = wp_parse_args( $args, $defaults );

		// Höger bildkolumn
		$img_url = $img_alt = $img_caption = '';
		if ( is_array( $a['rightImage'] ) ) {
			$img_url     = ! empty( $a['rightImage']['url'] ) ? $a['rightImage']['url'] : ( $a['rightImage']['src'] ?? '' );
			$img_alt     = $a['rightImage']['alt'] ?? '';
			$img_caption = $a['rightImage']['caption'] ?? '';
		} elseif ( is_int( $a['rightImage'] ) && $a['rightImage'] > 0 ) {
			$img_url = wp_get_attachment_image_url( $a['rightImage'], 'full' ) ?: '';
			$img_alt = get_post_meta( $a['rightImage'], '_wp_attachment_image_alt', true ) ?: '';
		}
		$has_img = ! empty( $img_url );

		$img_styles = array();
		if ( ! empty( $a['imageWidth'] ) )  $img_styles[] = 'width:' . esc_attr( $a['imageWidth'] );
		if ( ! empty( $a['imageSize'] ) )   $img_styles[] = 'object-fit:' . esc_attr( $a['imageSize'] );
		if ( $ar = tm_aspect_to_css( $a['imageAspect'] ) ) $img_styles[] = 'aspect-ratio:' . esc_attr( $ar );
		$img_style_attr = empty( $img_styles ) ? '' : ' style="' . esc_attr( implode( ';', $img_styles ) ) . '"';

		$article_classes = 'text-modal-article ' . ( $has_img ? 'two-columns' : 'oneColumn' ) . ( ! empty( $a['columnOrder'] ) ? ' invert' : '' );
		$section_classes = 'text-modal-section' . ( ! empty( $a['columnOrder'] ) ? ' invertOrder' : '' ) . ' align-' . sanitize_html_class( $a['textAlign'] );

		$out  = '<article class="' . esc_attr( $article_classes ) . '">';
		$out .= '<section class="' . esc_attr( $section_classes ) . '">';
		$out .= tm_render_items_html( $a['items'] );
		$out .= '</section>';

		if ( $has_img ) {
			$out .= '<section class="image-modal-section"><div class="image-container"><figure class="image">';
			$out .= '<img src="' . esc_url( $img_url ) . '" alt="' . esc_attr( $img_alt ) . '"' . $img_style_attr . ' />';
			if ( $img_caption !== '' ) $out .= '<figcaption>' . esc_html( $img_caption ) . '</figcaption>';
			$out .= '</figure></div></section>';
		}

		$out .= '</article>';
		return $out;
	}
}
