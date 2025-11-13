<?php
// This file is generated. Do not modify it manually.
return array(
	'blogg-card-wrapper' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'custom/blogg-card-wrapper',
		'version' => '0.1.0',
		'title' => 'Blogg Card Wrapper',
		'category' => 'layout',
		'icon' => 'grid-view',
		'description' => 'A block that allows for a dynamic number of blogg cards.',
		'attributes' => array(
			'numberOfCards' => array(
				'type' => 'number',
				'default' => 3
			),
			'cardContents' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'image' => array(
				'type' => 'integer'
			),
			'showHeading' => array(
				'type' => 'boolean',
				'default' => true
			),
			'showBody' => array(
				'type' => 'boolean',
				'default' => true
			),
			'showImage' => array(
				'type' => 'boolean',
				'default' => true
			),
			'showButton' => array(
				'type' => 'boolean',
				'default' => true
			),
			'buttonText' => array(
				'type' => 'string',
				'default' => 'Button text'
			)
		),
		'supports' => array(
			'html' => false
		),
		'textdomain' => 'blogg-card-wrapper',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScript' => 'file:./view.js'
	),
	'card-modal' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'custom-text-block/card-modal',
		'version' => '0.1.0',
		'title' => 'card-modal',
		'category' => 'design',
		'attributes' => array(
			'numberOfCards' => array(
				'type' => 'number',
				'default' => 1
			),
			'cards' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'columnOrder' => array(
				'type' => 'boolean',
				'default' => false
			),
			'faIcon' => array(
				'type' => 'string',
				'default' => '"\\f00c"'
			),
			'faIconColor' => array(
				'type' => 'string',
				'default' => '#E03131'
			),
			'items' => array(
				'type' => 'array',
				'default' => array(
					array(
						'id' => 'h1',
						'type' => 'heading',
						'text' => 'Rubrik',
						'size' => 'l',
						'headingType' => 'h2'
					),
					array(
						'id' => 'p1',
						'type' => 'paragraph',
						'text' => 'Lägg till brödtext här…'
					)
				)
			),
			'cardCount' => array(
				'type' => 'number',
				'default' => 1
			),
			'modalBackground' => array(
				'type' => 'integer'
			),
			'style' => array(
				'type' => 'object'
			),
			'contentOrientation' => array(
				'type' => 'boolean',
				'default' => false
			),
			'backgroundColor' => array(
				'type' => 'string'
			),
			'image' => array(
				'type' => 'integer'
			),
			'textColor' => array(
				'type' => 'string',
				'default' => '#000010'
			),
			'faIconStyle' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'faIconRaw' => array(
				'type' => 'string',
				'default' => 'f00e'
			),
			'align' => array(
				'type' => 'string',
				'default' => 'none'
			),
			'cardBorder' => array(
				'type' => 'string',
				'default' => 'Show'
			),
			'imageWidth' => array(
				'type' => 'string',
				'default' => '100%'
			),
			'imageSize' => array(
				'type' => 'string',
				'default' => 'cover'
			),
			'imageAspect' => array(
				'type' => 'string',
				'default' => '3/2'
			),
			'bgImageStyle' => array(
				'type' => 'string',
				'default' => 'color'
			),
			'cardWidthOptions' => array(
				'type' => 'string',
				'default' => ''
			),
			'modalType' => array(
				'type' => 'string',
				'default' => 'columns'
			),
			'topSectionFlags' => array(
				'type' => 'array',
				'default' => array(
					
				)
			)
		),
		'description' => 'Card modal',
		'example' => array(
			
		),
		'supports' => array(
			'html' => false,
			'color' => array(
				'background' => true,
				'gradients' => true
			),
			'spacing' => array(
				'padding' => true,
				'margin' => true
			),
			'typography' => array(
				'textAlign' => true
			),
			'border' => true,
			'style' => true,
			'align' => true
		),
		'textdomain' => 'custom-text-block',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScript' => 'file:./view.js'
	),
	'faq-modal' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'custom-text-block/faq-modal',
		'version' => '0.1.0',
		'title' => 'FAQ Modal',
		'category' => 'design',
		'attributes' => array(
			'items' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'modalBackground' => array(
				'type' => 'integer'
			),
			'style' => array(
				'type' => 'object'
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
			),
			'image' => array(
				'type' => 'integer'
			),
			'columnOrder' => array(
				'type' => 'boolean',
				'default' => 'false'
			),
			'faIconStyle' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'faIconColor' => array(
				'type' => 'string',
				'default' => '#6f2t54'
			),
			'faIconRaw' => array(
				'type' => 'string',
				'default' => 'f00e'
			),
			'cardBorder' => array(
				'type' => 'string',
				'default' => 'Show'
			),
			'faIcon' => array(
				'type' => 'string',
				'default' => '\\f00e'
			)
		),
		'description' => 'Text modal for all text needs',
		'example' => array(
			
		),
		'supports' => array(
			'html' => false,
			'color' => array(
				'background' => true,
				'gradients' => true
			),
			'spacing' => array(
				'padding' => true,
				'margin' => true
			),
			'typography' => true,
			'border' => true,
			'style' => true,
			'align' => true
		),
		'textdomain' => 'custom-text-block',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScript' => 'file:./view.js'
	),
	'hero-modal' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'custom-text-block/hero-modal',
		'version' => '0.1.0',
		'title' => 'Hero Modal',
		'category' => 'design',
		'attributes' => array(
			'items' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'modalBackground' => array(
				'type' => 'integer'
			),
			'style' => array(
				'type' => 'object'
			)
		),
		'description' => 'Hero modal that should be placed at the top of each page.',
		'example' => array(
			
		),
		'supports' => array(
			'html' => false,
			'color' => array(
				'background' => true,
				'gradients' => true
			),
			'spacing' => array(
				'padding' => true,
				'margin' => true
			),
			'typography' => true,
			'border' => true,
			'style' => true,
			'align' => true
		),
		'textdomain' => 'custom-text-block',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScript' => 'file:./view.js'
	),
	'text-modal' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'custom-text-block/text-modal',
		'version' => '0.1.0',
		'title' => 'Text Modal',
		'category' => 'design',
		'attributes' => array(
			'items' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'modalBackground' => array(
				'type' => 'integer'
			),
			'style' => array(
				'type' => 'object'
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
			),
			'image' => array(
				'type' => 'integer'
			),
			'id' => array(
				'type' => 'integer'
			),
			'columnOrder' => array(
				'type' => 'boolean',
				'default' => 'false'
			),
			'faIconStyle' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'faIconColor' => array(
				'type' => 'string',
				'default' => '#6f2t54'
			),
			'faIconRaw' => array(
				'type' => 'string',
				'default' => 'f00e'
			),
			'faIcon' => array(
				'type' => 'string',
				'default' => '\\f00e'
			),
			'textAlign' => array(
				'type' => 'string',
				'default' => 'none'
			),
			'cardBorder' => array(
				'type' => 'string',
				'default' => 'Show'
			),
			'imageWidth' => array(
				'type' => 'string',
				'default' => '100%'
			),
			'imageSize' => array(
				'type' => 'string',
				'default' => 'cover'
			),
			'imageAspect' => array(
				'type' => 'string',
				'default' => '3/2'
			)
		),
		'description' => 'Text modal for all text needs',
		'example' => array(
			
		),
		'supports' => array(
			'html' => true,
			'color' => array(
				'background' => true,
				'gradients' => true
			),
			'typography' => array(
				'textAlign' => true
			),
			'spacing' => array(
				'padding' => true,
				'margin' => true
			),
			'border' => true,
			'style' => true
		),
		'textdomain' => 'custom-text-block',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScript' => 'file:./view.js'
	)
);
