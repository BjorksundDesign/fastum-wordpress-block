<?php
// Hämta bakgrundsbildens URL och storlek
$background_url = $attributes['style']['background']['backgroundImage']['url'] ?? '';
$background_size = $attributes['style']['background']['backgroundSize'] ?? 'cover';
// Bygg inline style
$inline_style = '';

if ($background_url) {
    $inline_style .= "background:url('" . esc_url($background_url) . "');";
    $inline_style .= "background-size: {$background_size};";
    $inline_style .= "background-repeat: no-repeat;";
    $inline_style .= "background-position: center center;";
}

$block_props = get_block_wrapper_attributes( array(
    'class' => 'heroWrapper',
    'style' => $inline_style,
) );
?>


<div <?php echo $block_props; ?>>
	<section class="hero-modal-section">
	<div role="text-wrapper" className="text-wrapper">
    	<?php if (!empty($attributes['items']) && is_array($attributes['items'])): ?>
        <?php foreach ($attributes['items'] as $item): ?>
            <?php
                $type = $item['type'] ?? '';
                $text = $item['text'] ?? '';
                $id = $item['id'] ?? '';
            ?>
            
            <?php switch ($type):
                case 'heading':
                    $size = $item['size'] ?? 'medium';
                    ?>
                    <h1 class="heading <?php echo esc_attr($size); ?>">
                        <?php echo esc_html($text ?: 'Heading'); ?>
                    </h1>
                    <?php
                    break;

                case 'paragraph':
                    ?>
                    <p class="body">
                        <?php echo esc_html($text ?: 'Paragraph'); ?>
                    </p>
                    <?php
                    break;

                default:
                    // Unknown type – skip
                    break;
            endswitch; ?>
        <?php endforeach; ?>
    	<?php endif; ?>
	</div>	
	<div role="button-wrapper" class="button-wrapper <?php echo esc_attr($attributes['align'] ?? ''); ?>">
    	<?php if (!empty($attributes['items']) && is_array($attributes['items'])): ?>
        <?php foreach ($attributes['items'] as $item): ?>
            <?php
                $type = $item['type'] ?? '';
                $text = $item['text'] ?? '';
                $id = $item['id'] ?? '';
            ?>
            
            <?php switch ($type):
                case 'button':
                    $isPrimary = $item['isPrimary'] ?? false;
                    $url = isset($item['url']['url']) ? $item['url']['url'] : '#';
                    $buttonClass = $isPrimary ? 'button-primary' : 'button-secondary';
                    ?>
                    <button 
                        class="<?php echo esc_attr("$buttonClass wp-block-button fastum-button"); ?>" 
                        onclick="window.open('<?php echo esc_url($url); ?>', '_blank')" 
                    >
                        <span class="wp-block-button__link">
                            <?php echo esc_html($text ?: 'Button text'); ?>
                        </span>
                    </button>
                    <?php
                    break;

                default:
                    // Unknown type – skip
                    break;
            endswitch; ?>
        <?php endforeach; ?>
    	<?php endif; ?>
	</div>	
</section>
</div>