<?php
/**
 * Server render for your block mirroring save.js
 */

    // 0) Normalize attributes
    $attributes = is_array($attributes) ? $attributes : [];

    $align           = isset($attributes['align']) ? (string) $attributes['align'] : '';
    $textColor       = isset($attributes['textColor']) ? trim((string) $attributes['textColor']) : '';
    $modalType       = isset($attributes['modalType']) ? (string) $attributes['modalType'] : '';
    $bgImageStyle    = isset($attributes['bgImageStyle']) ? (string) $attributes['bgImageStyle'] : '';
    $items           = isset($attributes['items']) && is_array($attributes['items']) ? $attributes['items'] : [];
    $backgroundColor = isset($attributes['backgroundColor']) ? (string) $attributes['backgroundColor'] : '';
   

    // New / used in save.js
    $cards            = isset($attributes['cards']) && is_array($attributes['cards']) ? $attributes['cards'] : [];
    $imageSize        = isset($attributes['imageSize']) ? (string) $attributes['imageSize'] : '';      // cover|contain (klass + object-fit)
    $imageWidth       = isset($attributes['imageWidth']) ? (string) $attributes['imageWidth'] : '100%';
    $imageAspect      = isset($attributes['imageAspect']) ? (string) $attributes['imageAspect'] : 'none';
    $imageSize        = isset($attributes['imageSize']) ? (string) $attributes['imageSize'] : '';  // ev. extra klass
    $cardBorder       = isset($attributes['cardBorder']) ? (string) $attributes['cardBorder'] : '';
    $cardWidthOptions = isset($attributes['cardWidthOptions']) ? (string) $attributes['cardWidthOptions'] : ''; // "400px" | "600px"
    $className        = isset($attributes['className']) ? (string) $attributes['className'] : '';
    $topSectionFlags  = isset($attributes['topSectionFlags']) ? (string) $attributes['topSectionFlags'] : '';


    $faIcon      = isset($attributes['faIcon']) ? (string) $attributes['faIcon'] : '';
    $faIconColor = isset($attributes['faIconColor']) ? (string) $attributes['faIconColor'] : '';

    // Build article classes (match save.js)
    $article_classes = implode(' ', array_filter([
        'card-modal-article',
        sanitize_html_class($bgImageStyle),
        sanitize_html_class($modalType),
        'article',
    ]));

    $section_classes = implode(' ', array_filter([
        'card-modal-section',
        sanitize_html_class($modalType),
    ]));

     /** Background from block supports (optional) */
    $background_url       = $attributes['style']['background']['backgroundImage']['url'] ?? '';
    $background_size      = $attributes['style']['background']['backgroundSize'] ?? 'cover';
    $background_position  = $attributes['style']['background']['backgroundPosition'] ?? ''; // ← NY

    // Build inline style (bg image + optional bg color)
    $inline_style_parts = [];
    if ($background_url) {
    $inline_style_parts[] = "background-image:url('" . esc_url($background_url) . "')";
    $inline_style_parts[] = "background-size:" . esc_attr($background_size);
    $inline_style_parts[] = "background-repeat:no-repeat";
    if ($background_position !== '') {
        $inline_style_parts[] = "background-position:" . esc_attr($background_position);
    } else {
        $inline_style_parts[] = "background-position:center center";
    }
}
    if (!empty($backgroundColor)) {
        // överstyr ev. bild
        $inline_style_parts[] = "background:unset";
        $inline_style_parts[] = "background-color:" . esc_attr($backgroundColor);
    }
    // Add CSS variables (now correctly quoted for --faIcon)
    if ($faIcon !== '') {
        $inline_style_parts[] = '--faIcon:"' . esc_attr($faIcon) . '"';
    }
    if ($faIconColor !== '') {
        $inline_style_parts[] = '--iconColor:' . esc_attr($faIconColor);
    }
    $inline_style = implode(';', $inline_style_parts);
    if ($inline_style && substr($inline_style, -1) !== ';') { $inline_style .= ';'; }

    // Apply wrapper attrs to <article>
    $wrapper_attrs = get_block_wrapper_attributes([
        'class' => $article_classes,
        'style' => $inline_style,
    ]);

    // Helpers
    $get_url = static function($maybeUrl) {
        if (empty($maybeUrl)) return '#';
        if (is_string($maybeUrl)) return $maybeUrl;
        if (is_array($maybeUrl)) {
            return $maybeUrl['url'] ?? ($maybeUrl['href'] ?? ($maybeUrl['link'] ?? '#'));
        }
        return '#';
    };

    // NOTE: keeping original section flag behavior (includes 'text-modal-section')
    $section_flags = static function($list) {
        $has_text   = !empty($list) && array_reduce($list, fn($c,$it)=> $c || in_array(($it['type'] ?? ''), ['heading','paragraph','list'], true), false);
        $has_image  = !empty($list) && array_reduce($list, fn($c,$it)=> $c || (($it['type'] ?? '') === 'image'), false);
        $has_button = !empty($list) && array_reduce($list, fn($c,$it)=> $c || (($it['type'] ?? '') === 'button'), false);
        return trim('text-modal-section'
            . ($has_text   ? ' contains-text'   : '')
            . ($has_image  ? ' contains-image'  : '')
            . ($has_button ? ' contains-button' : '')
        );
    };

    $split_on_first_heading = static function($arr = []) {
        if (empty($arr)) return ['first' => null, 'rest' => [], 'firstIndex' => -1];
        $idx = -1;
        foreach ($arr as $i => $it) {
            if (($it['type'] ?? '') === 'heading') { $idx = $i; break; }
        }
        $i = $idx >= 0 ? $idx : 0;
        $first = $arr[$i] ?? null;
        $rest  = [];
        foreach ($arr as $k => $v) { if ($k !== $i) $rest[] = $v; }
        return ['first' => $first, 'rest' => $rest, 'firstIndex' => $i];
    };

    ?>
   <article <?php echo $wrapper_attrs; ?>>
    <?php
        $top_flags = isset($attributes['topSectionFlags']) ? trim((string) $attributes['topSectionFlags']) : '';
        if ($top_flags === '') {
            $top_flags = $section_flags($items); // fallback to computed flags
        }
        $show_top_section = ($topSectionFlags !== '' || $modalType === 'lime-form');

            echo '<script>';
            echo 'console.log("show_top_section:", ' . json_encode($show_top_section) . ');';
            echo 'console.log("section_flags:", ' . json_encode($topSectionFlags) . ');';
            echo '</script>';
        ?>

    <?php if ( $show_top_section ): ?>
    <section class="<?php echo esc_attr($section_classes); ?>">

        <?php if ($show_top_section !== ''): ?>
            <div class="text-modal-section <?php echo esc_attr($topSectionFlags); ?>">

            <?php
            // TEXT (order:2)
            $tw_classes = 'text-wrapper ' . $align;
            $tw_style   = 'order:2;' . ($textColor !== '' ? ' color:' . esc_attr($textColor) . ';' : '');
            ?>
            <div class="<?php echo esc_attr($tw_classes); ?>" style="<?php echo esc_attr($tw_style); ?>">
                <?php if (!empty($items)) : ?>
                    <?php foreach ($items as $item): if (empty($item['type'])) continue; ?>
                        <?php
                        switch ($item['type']) {
                            case 'heading':
                                $headingTag = !empty($item['headingType']) ? preg_replace('/[^a-z0-9]/i', '', $item['headingType']) : 'h2';
                                $sizeClass  = !empty($item['size']) ? sanitize_html_class($item['size']) : 'xl';
                                $text       = $item['text'] ?? '';
                                printf(
                                    '<%1$s class="heading %2$s %3$s">%4$s</%1$s>',
                                    esc_html($headingTag),
                                    esc_attr($sizeClass),
                                    esc_attr($align),
                                    wp_kses_post($text)
                                );
                                break;

                            case 'paragraph':
                                $p_text = $item['text'] ?? '';
                                printf('<p class="paragraph %1$s">%2$s</p>', esc_attr($align), wp_kses_post($p_text));
                                break;

                            case 'list':
                                if ($modalType === 'hero') break;
                                $list_items = (isset($item['list']) && is_array($item['list'])) ? $item['list'] : [];
                                $icon       = $item['icon']      ?? '"\\f00c"';
                                $icon_color = $item['iconColor'] ?? '#000000';
                                echo '<ul class="text-modal-ul ' . esc_attr($align) . '">';
                                foreach ($list_items as $liText) {
                                    printf(
                                        '<li class="list" style="--faIcon:%1$s; --iconColor:%2$s;"><span>%3$s</span></li>',
                                        esc_attr($icon),
                                        esc_attr($icon_color),
                                        wp_kses_post($liText)
                                    );
                                }
                                echo '</ul>';
                                break;
                        }
                        ?>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <?php
            // BUTTONS (order:3)
            $buttonCount = 0;
            foreach ($items as $i) { if (($i['type'] ?? '') === 'button') $buttonCount++; }
            if ($buttonCount > 0):
                $btn_wrapper_styles = ['order:3'];
                if ($textColor !== '') $btn_wrapper_styles[] = 'color:' . esc_attr($textColor);
                $btn_wrapper_style_attr = implode(';', $btn_wrapper_styles);
                if ($btn_wrapper_style_attr && substr($btn_wrapper_style_attr, -1) !== ';') $btn_wrapper_style_attr .= ';';
            ?>
            <div
                class="button-wrapper <?php echo esc_attr(trim($align . ' ' . $modalType)); ?>"
                style="<?php echo esc_attr($btn_wrapper_style_attr); ?>"
            >
                <?php foreach ($items as $it): if (($it['type'] ?? '') !== 'button') continue; ?>
                    <?php
                    if ($buttonCount > 1 && $modalType === 'cards') echo '<hr />';
                    $isPrimary = !empty($it['isPrimary']);
                    $url       = $get_url($it['url'] ?? null);
                    $btn_text  = $it['text'] ?? (isset($it['count']) ? 'Button ' . (int)$it['count'] : 'Button');
                    $btn_class = trim(($isPrimary ? 'button-primary' : 'button-secondary') . ' ' . $align . ' ' . $modalType);
                    printf(
                        '<a class="wp-block-button fastum-button %1$s" href="%2$s" target="_blank" rel="noopener"><span class="wp-block-button__link">%3$s</span></a>',
                        esc_attr($btn_class),
                        esc_url($url),
                        esc_html($btn_text)
                    );
                    ?>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

        </div><!-- /.text-modal-section -->
        <?php endif; ?>

        <?php if ( $modalType === 'lime-form' ) : ?>
            <div class="custom-container">
                <?php
                $printed_inner = false;
                if ( isset($block) && $block instanceof WP_Block && !empty($block->inner_blocks) ) {
                    foreach ( $block->inner_blocks as $inner ) { echo $inner->render(); }
                    $printed_inner = true;
                }
                if ( ! $printed_inner && ! empty($content) ) {
                    $parsed = parse_blocks( $content );
                    if ( ! empty( $parsed ) ) {
                        foreach ( $parsed as $inner_parsed ) { echo render_block( $inner_parsed ); }
                        $printed_inner = true;
                    }
                }
                if ( ! $printed_inner && ! empty($content) ) { echo $content; }
                ?>
            </div>
        <?php endif; ?>

    </section>
    <?php endif; ?>

        <?php if ($modalType !== 'hero' && $modalType !== 'lime-form'  && count($cards) > 0): ?>
            <div class="cards-grid <?php echo esc_attr(sanitize_html_class($modalType)); ?>">
                <?php foreach ($cards as $card): ?>
                    <?php
                    $card_bg         = (string)($card['backgroundColor'] ?? '');
                    $card_id         = (string)($card['id'] ?? '');
                    $raw_card_align    = $card['align'] ?? $align ?? 'leftAlignText';
                    $card_align     = sanitize_html_class( $raw_card_align ? (string)$raw_card_align : 'leftAlignText' );
                    $per_items       = (isset($card['items']) && is_array($card['items'])) ? $card['items'] : [];
                    $card_text_color = (string)($card['textColor'] ?? $textColor);

                    $card_order = isset($card['cardOrderMobile']) ? (string) $card['cardOrderMobile'] : '';

                    // Common classes/styles for both cards & dropdown
                    $base_classes = implode(' ', array_filter([
                        ($modalType === 'dropdown') ? 'dropdown-modal-card' : 'card-modal-card',
                        sanitize_html_class($imageSize),
                        sanitize_html_class($card_align),
                        sanitize_html_class($cardBorder),
                    ]));
                    $style_parts = [];
                    if ($card_bg !== '')         { $style_parts[] = 'background-color:' . esc_attr($card_bg); }
                    if ($cardWidthOptions !== ''){ $style_parts[] = 'max-width:' . esc_attr($cardWidthOptions); }
                    if ($card_order !== '')      { $style_parts[] = '--currentCardOrder:' . esc_attr($card_order); }  // ← add this

                    $style_attr = implode(';', $style_parts);
                    if ($style_attr && substr($style_attr, -1) !== ';') { $style_attr .= ';'; }

                    // Dropdown: split first/rest
                    if ($modalType === 'dropdown') {
                        $split = $split_on_first_heading($per_items);
                        $first = $split['first'];
                        $rest  = $split['rest'];
                        ?>
                        <section
                            <?php if ($card_id !== ''): ?>id="<?php echo esc_attr($card_id); ?>"<?php endif; ?>
                            class="<?php echo esc_attr($base_classes); ?>"
                            <?php if ($style_attr !== ''): ?>style="<?php echo esc_attr($style_attr); ?>"<?php endif; ?>
                        >
                            <details class="accordion-card <?php echo esc_attr(trim($card_align . ' ' . $cardBorder)); ?>"
                                style="<?php echo esc_attr('color:' . $card_text_color . ';'); ?>">

                                <summary class="accordion-card__summary" aria-expanded="false">
                                    <div class="<?php echo esc_attr($section_flags($first ? [$first] : [])); ?>">
                                        <?php
                                        if ($first) {
                                            // Only heading in summary
                                            if (($first['type'] ?? '') === 'heading') {
                                                $tag  = !empty($first['headingType']) ? preg_replace('/[^a-z0-9]/i', '', $first['headingType']) : 'h2';
                                                $size = !empty($first['size']) ? sanitize_html_class($first['size']) : 'xl';
                                                $txt  = $first['text'] ?? '';
                                                printf(
                                                    '<%1$s class="heading %2$s %3$s">%4$s</%1$s>',
                                                    esc_html($tag),
                                                    esc_attr($size),
                                                    esc_attr($card_align),
                                                    wp_kses_post($txt)
                                                );
                                            }
                                        }
                                        ?>
                                    </div>
                                </summary>
                                <div class="accordion-card__content">
                                    <div class="<?php echo esc_attr($section_flags($rest)); ?>">
                                        <?php
                                        // Images (order:1)
                                        $images = array_values(array_filter($rest, static fn($it)=> ($it['type'] ?? '') === 'image'));
                                        if (!empty($images)) {
                                            $img_style = [];
                                            if ($imageWidth !== '') { $img_style[] = 'width:' . esc_attr($imageWidth); }
                                            if ($imageAspect && $imageAspect !== 'none') { $img_style[] = 'aspect-ratio:' . esc_attr($imageAspect); }
                                            if ($imageSize !== '') { $img_style[] = 'object-fit:' . esc_attr($imageSize); }
                                            $img_style_attr = implode(';', $img_style);
                                            if ($img_style_attr && substr($img_style_attr, -1) !== ';') { $img_style_attr .= ';'; }

                                            // NOTE: keeping imageWidth in class as requested
                                            $img_class      = trim('text-modal-img ' . $imageAspect . ' ' . $imageSize . ' ' . $imageWidth);
                                            $img_wrap_class = trim('image-container ' . $imageSize);

                                            echo '<div class="image-wrapper" style="order:1">';
                                            foreach ($images as $imgItem) {
                                                $payload = $imgItem['image'] ?? $imgItem ?? null;
                                                echo '<div class="' . esc_attr($img_wrap_class) . '">';

                                                // 1) Normalisera till id eller url
                                                $id  = 0;
                                                $url = '';
                                                if (is_numeric($payload)) {
                                                    $id = (int) $payload;
                                                } elseif (is_array($payload)) {
                                                    if (!empty($payload['id']) && is_numeric($payload['id'])) {
                                                        $id = (int) $payload['id'];
                                                    } else {
                                                        $url = $payload['url'] ?? ($payload['source_url'] ?? ($payload['sizes']['large']['url'] ?? ''));
                                                    }
                                                } elseif (is_string($payload) && $payload !== '') {
                                                    $url = $payload;
                                                }

                                                // 2) Bestäm alt i denna ordning: item.alt -> payload.alt/alt_text -> media-meta
                                                $alt = '';
                                                if (!empty($imgItem['alt'])) {
                                                    $alt = (string) $imgItem['alt'];
                                                } elseif (is_array($payload) && !empty($payload['alt'])) {
                                                    $alt = (string) $payload['alt'];
                                                } elseif (is_array($payload) && !empty($payload['alt_text'])) {
                                                    $alt = (string) $payload['alt_text'];
                                                } elseif ($id) {
                                                    $meta_alt = get_post_meta($id, '_wp_attachment_image_alt', true);
                                                    if (!empty($meta_alt)) {
                                                        $alt = (string) $meta_alt;
                                                    }
                                                }

                                                // 3) Rendera – inkludera alt ENDAST om den inte är tom
                                                if ($id) {
                                                    $atts = [
                                                        'class' => $img_class,
                                                        'style' => $img_style_attr,
                                                    ];
                                                    if ($alt !== '') {
                                                        $atts['alt'] = esc_attr($alt);
                                                    }
                                                    echo wp_get_attachment_image($id, 'large', false, $atts);
                                                } elseif ($url) {
                                                    printf(
                                                        '<img class="%1$s" src="%2$s"%3$s style="%4$s" />',
                                                        esc_attr($img_class),
                                                        esc_url($url),
                                                        $alt !== '' ? ' alt="' . esc_attr($alt) . '"' : '',
                                                        esc_attr($img_style_attr)
                                                    );
                                                }

                                                echo '</div>'; // .image-container
                                            }
                                            echo '</div>'; // .image-wrapper
                                        } // end if images

                                        // Text (order:2)
                                        $has_text = array_reduce($rest, fn($c,$it)=> $c || in_array(($it['type'] ?? ''), ['heading','paragraph','list'], true), false);
                                        if ($has_text) {
                                            $text_style = 'order:2;' . ($card_text_color !== '' ? ' color:' . esc_attr($card_text_color) . ';' : '');
                                            echo '<div class="text-wrapper ' . esc_attr($card_align) . '" style="' . esc_attr($text_style) . '">';
                                            foreach ($rest as $it) {
                                                switch ($it['type'] ?? '') {
                                                    case 'heading':
                                                        $tag  = !empty($it['headingType']) ? preg_replace('/[^a-z0-9]/i', '', $it['headingType']) : 'h2';
                                                        $size = !empty($it['size']) ? sanitize_html_class($it['size']) : 'xl';
                                                        $txt  = $it['text'] ?? '';
                                                        printf(
                                                            '<%1$s class="heading %2$s %3$s">%4$s</%1$s>',
                                                            esc_html($tag),
                                                            esc_attr($size),
                                                            esc_attr($card_align),
                                                            wp_kses_post($txt)
                                                        );
                                                        break;
                                                    case 'paragraph':
                                                        $txt = $it['text'] ?? '';
                                                        printf('<p class="paragraph %1$s">%2$s</p>', esc_attr($card_align), wp_kses_post($txt));
                                                        break;
                                                    case 'list':
                                                        $list_items = (isset($it['list']) && is_array($it['list'])) ? $it['list'] : [];
                                                        $icon       = $it['icon']      ?? '"\\f00c"';
                                                        $icon_color = $it['iconColor'] ?? '#000000';
                                                        echo '<ul class="text-modal-ul ' . esc_attr($card_align) . '">';
                                                        foreach ($list_items as $liText) {
                                                            printf('<li class="list" style="--faIcon:%1$s; --iconColor:%2$s;"><span>%3$s</span></li>',
                                                                esc_attr($icon),
                                                                esc_attr($icon_color),
                                                                wp_kses_post($liText)
                                                            );
                                                        }
                                                        echo '</ul>';
                                                        break;
                                                }
                                            }
                                            echo '</div>';
                                        }

                                        // Buttons (order:3)
                                        $card_button_count = 0;
                                        foreach ($rest as $pi) { if (($pi['type'] ?? '') === 'button') $card_button_count++; }
                                        if ($card_button_count > 0) {
                                            $btn_styles = ['order:3'];
                                            if ($card_text_color !== '') $btn_styles[] = 'color:' . esc_attr($card_text_color);
                                            $btn_style_attr = implode(';', $btn_styles);
                                            if ($btn_style_attr && substr($btn_style_attr, -1) !== ';') $btn_style_attr .= ';';

                                            echo '<div class="button-wrapper ' . esc_attr(trim($card_align . ' ' . $modalType)) . '" style="' . esc_attr($btn_style_attr) . '">';
                                            foreach ($rest as $btn) {
                                                if (($btn['type'] ?? '') !== 'button') continue;
                                                $isPrimary = !empty($btn['isPrimary']);
                                                $url       = $get_url($btn['url'] ?? null);
                                                $btn_text  = $btn['text'] ?? (isset($btn['count']) ? 'Button ' . (int)$btn['count'] : 'Button');
                                                $btn_class = trim(($isPrimary ? 'button-primary' : 'button-secondary') . ' ' . $card_align . ' ' . $modalType);
                                                
                                                if ($modalType === 'cards' || $modalType === 'dropdown') { echo '<hr />'; }
                                                printf(
                                                '<a class="wp-block-button fastum-button %1$s" href="%2$s" target="_blank" rel="noopener"><span class="wp-block-button__link">%3$s</span></a>',
                                                esc_attr($btn_class),
                                                esc_url($url),
                                                esc_html($btn_text)
                                                );
                                            }
                                            echo '</div>';
                                        }
                                        ?>
                                    </div>
                                </div>
                            </details>
                        </section>
                        <?php
                        continue; // nästa card (dropdown klart)
                    }
                    ?>

                    <!-- Cards/Columns -->
                    <section
                        <?php if ($card_id !== ''): ?>id="<?php echo esc_attr($card_id); ?>"<?php endif; ?>
                        class="<?php echo esc_attr($base_classes); ?>"
                        <?php if ($style_attr !== ''): ?>style="<?php echo esc_attr($style_attr); ?>"<?php endif; ?>
                    >
                        <?php
                        $card_flags = $section_flags($per_items);
                        echo '<div class="' . esc_attr($card_flags) . '">';

                        // Images (order:1)
                        $images = array_values(array_filter($per_items, static fn($it) => ($it['type'] ?? '') === 'image'));
                        if (!empty($images)) {
                            $img_style = [];
                            if ($imageWidth !== '') { $img_style[] = 'width:' . esc_attr($imageWidth); }
                            if ($imageAspect && $imageAspect !== 'none') { $img_style[] = 'aspect-ratio:' . esc_attr($imageAspect); }
                            if ($imageSize !== '') { $img_style[] = 'object-fit:' . esc_attr($imageSize); }
                            $img_style_attr = implode(';', $img_style);
                            if ($img_style_attr && substr($img_style_attr, -1) !== ';') { $img_style_attr .= ';'; }

                            // NOTE: keeping imageWidth in class as requested
                            $img_class      = trim('text-modal-img ' . $imageAspect . ' ' . $imageSize . ' ' . $imageWidth);
                            $img_wrap_class = trim('image-container ' . $imageSize);

                            echo '<div class="image-wrapper" style="order:1">';
                           foreach ($images as $imgItem) {
                                 $payload = $imgItem['image'] ?? $imgItem ?? null;
                                echo '<div class="' . esc_attr($img_wrap_class) . '">';

                                // Normalisera till id/url
                                $id  = 0;
                                $url = '';
                                if (is_numeric($payload)) {
                                    $id = (int) $payload;
                                } elseif (is_array($payload)) {
                                    if (!empty($payload['id']) && is_numeric($payload['id'])) {
                                        $id = (int) $payload['id'];
                                    } else {
                                        $url = $payload['url'] ?? ($payload['source_url'] ?? ($payload['sizes']['large']['url'] ?? ''));
                                    }
                                } elseif (is_string($payload) && $payload !== '') {
                                    $url = $payload;
                                }

                                // Bestäm alt i ordning: item.alt -> payload.alt/alt_text -> media-meta
                                $alt = '';
                                if (!empty($imgItem['alt'])) {
                                    $alt = (string) $imgItem['alt'];
                                } elseif (is_array($payload) && !empty($payload['alt'])) {
                                    $alt = (string) $payload['alt'];
                                } elseif (is_array($payload) && !empty($payload['alt_text'])) {
                                    $alt = (string) $payload['alt_text'];
                                } elseif ($id) {
                                    $meta_alt = get_post_meta($id, '_wp_attachment_image_alt', true);
                                    if (!empty($meta_alt)) {
                                        $alt = (string) $meta_alt;
                                    }
                                }

                                // Rendera: inkludera alt endast om icke-tom
                                if ($id) {
                                    $atts = [
                                        'class' => $img_class,
                                        'style' => $img_style_attr,
                                    ];
                                    if ($alt !== '') {
                                        $atts['alt'] = esc_attr($alt);
                                    }
                                    echo wp_get_attachment_image($id, 'large', false, $atts);
                                } elseif ($url) {
                                    printf(
                                        '<img class="%1$s" src="%2$s"%3$s style="%4$s" />',
                                        esc_attr($img_class),
                                        esc_url($url),
                                        $alt !== '' ? ' alt="' . esc_attr($alt) . '"' : '',
                                        esc_attr($img_style_attr)
                                    );
                                }

                                echo '</div>'; // .image-container
                            }
                            echo '</div>'; // .image-wrapper
                        } // end if images

                        // Text (order:2)
                        $has_text = array_reduce($per_items, fn($c,$it)=> $c || in_array(($it['type'] ?? ''), ['heading','paragraph','list'], true), false);
                        if ($has_text) {
                            $text_style = 'order:2;' . ($card_text_color !== '' ? ' color:' . esc_attr($card_text_color) . ';' : '');
                            echo '<div class="text-wrapper ' . esc_attr($card_align) . '" style="' . esc_attr($text_style) . '">';
                            foreach ($per_items as $it) {
                                switch ($it['type'] ?? '') {
                                    case 'heading':
                                        $tag  = !empty($it['headingType']) ? preg_replace('/[^a-z0-9]/i', '', $it['headingType']) : 'h2';
                                        $size = !empty($it['size']) ? sanitize_html_class($it['size']) : 'xl';
                                        $txt  = $it['text'] ?? '';
                                        printf(
                                            '<%1$s class="heading %2$s %3$s">%4$s</%1$s>',
                                            esc_html($tag),
                                            esc_attr($size),
                                            esc_attr($card_align),
                                            wp_kses_post($txt)
                                        );
                                        break;
                                    case 'paragraph':
                                        $txt = $it['text'] ?? '';
                                        printf('<p class="paragraph %1$s">%2$s</p>', esc_attr($card_align), wp_kses_post($txt));
                                        break;
                                    case 'list':
                                        $list_items = (isset($it['list']) && is_array($it['list'])) ? $it['list'] : [];
                                        $icon       = $it['icon']      ?? '"\\f00c"';
                                        $icon_color = $it['iconColor'] ?? '#000000';
                                        echo '<ul class="text-modal-ul ' . esc_attr($card_align) . '">';
                                        foreach ($list_items as $liText) {
                                            printf('<li class="list" style="--faIcon:%1$s; --iconColor:%2$s;"><span>%3$s</span></li>',
                                                esc_attr($icon),
                                                esc_attr($icon_color),
                                                wp_kses_post($liText)
                                            );
                                        }
                                        echo '</ul>';
                                        break;
                                }
                            }
                            echo '</div>';
                        }

                        // Buttons (order:3)
                        $card_button_count = 0;
                        foreach ($per_items as $pi) { if (($pi['type'] ?? '') === 'button') $card_button_count++; }
                        if ($card_button_count > 0) {
                            $btn_styles = ['order:3'];
                            if ($card_text_color !== '') $btn_styles[] = 'color:' . esc_attr($card_text_color);
                            $btn_style_attr = implode(';', $btn_styles);
                            if ($btn_style_attr && substr($btn_style_attr, -1) !== ';') $btn_style_attr .= ';';

                            echo '<div class="button-wrapper ' . esc_attr(trim($card_align . ' ' . $modalType)) . '" style="' . esc_attr($btn_style_attr) . '">';
                            foreach ($per_items as $btn) {
                                if (($btn['type'] ?? '') !== 'button') continue;
                                $isPrimary = !empty($btn['isPrimary']);
                                $url       = $get_url($btn['url'] ?? null);
                                $btn_text  = $btn['text'] ?? (isset($btn['count']) ? 'Button ' . (int)$btn['count'] : 'Button');
                                $btn_class = trim(($isPrimary ? 'button-primary' : 'button-secondary') . ' ' . $card_align . ' ' . $modalType);
                                if ($modalType === 'cards' || $modalType === 'dropdown') { echo '<hr />'; }
                                printf(
                                    '<a class="wp-block-button fastum-button %1$s" href="%2$s" target="_blank" rel="noopener"><span class="wp-block-button__link">%3$s</span></a>',
                                    esc_attr($btn_class),
                                    esc_url($url),
                                    esc_html($btn_text)
                                );
                            }
                            echo '</div>';
                        }

                        echo '</div>'; // /section flags
                        ?>
                    </section>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </article>
    <?php
