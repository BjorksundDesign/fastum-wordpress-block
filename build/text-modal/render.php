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

$block_props = get_block_wrapper_attributes(array(
    'class' => 'heroWrapper',
    'style' => $inline_style,
));
?>

<article class="text-modal-article" <?php echo $block_props; ?>>
    <section class="text-modal-section">
        <div role="text-wrapper" class="text-modal-section">
            <div class="text-wrapper">
                <?php if (!empty($attributes['items']) && is_array($attributes['items'])): ?>
                    <?php foreach ($attributes['items'] as $item): ?>
                        <?php
                        $type = $item['type'] ?? '';
                        $text = $item['text'] ?? '';
                        $id = $item['id'] ?? '';
                        ?>
                        
                        <?php switch ($type):
                            case 'heading':
                                $size = $item['size'] ?? 'medium'; // Default to 'medium' if size is not defined
                                $headingType = $item['headingType'] ?? 'h1'; // Get heading type from item, default to 'h1'
                                ?>
                                <<?php echo esc_html($headingType); ?> class="heading <?php echo esc_attr($size); ?> <?php echo esc_attr($attributes['align'] ?? ''); ?>">
                                    <?php echo esc_html($text ?: 'Heading'); ?>
                                </<?php echo esc_html($headingType); ?>>
                                <?php break;

                            case 'paragraph':
                                ?>
                                <p class="paragraph">
                                    <?php echo esc_html($text ?: 'Paragraph'); ?>
                                </p>
                                <?php break;

                            case 'list':
                                ?>
                                <ul class="text-modal-ul">
                                    <?php foreach ($item['list'] as $li): ?>
                                        <li class="list">
                                            <?php echo esc_html($li); ?>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                                <?php break;

                            case 'image':
                                $image_id = $item['image'] ?? ''; // Get the image ID from $item
                                $image_url = !empty($image_id) ? wp_get_attachment_url($image_id) : ''; // Get the image URL

                                // Construct the class names
                                $class_names = 'text-modal-img ';
                                $class_names .= esc_attr($attributes['imageAspectRatio'] ?? '') . ' ';
                                $class_names .= esc_attr($attributes['imageSizing'] ?? '') . ' ';
                                $class_names .= esc_attr($attributes['imageWidth'] ?? '');

                                if ($image_url): ?>
                                    <img src="<?php echo esc_url($image_url); ?>" class="<?php echo trim($class_names); ?>" alt="Image Description" />
                                <?php else: ?>
                                    <p>No image found.</p>
                                <?php endif;
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
                                <?php break;

                            default:
                                // Unknown type – skip
                                break;
                        endswitch; ?>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>    
        </div>
    </section>
</article>
