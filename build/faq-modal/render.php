<?php
/**
 * Server-side render callback för Dynamic Card Wrapper / FAQ-accordion
 *
 * Förväntar sig attribut likt dem som används i edit.js:
 * - backgroundColor (string)
 * - faIcon (string, t.ex. "\"\f00c\"" för CSS content)
 * - faIconColor (string, hex)
 * - items (array)            // global items (visas överst)
 * - cards (array of objects) // varje card: id, items[], backgroundColor, align, ...
 * - contentOrientation (bool)
 * - align, cardBorder (string)
 *
 * OBS: All businesslogik för att redigera ligger i edit.js; här renderar vi bara.
 */

/**
 * Hjälp: säkra heading-taggen (h1–h6), default h2
 */
function dcw_safe_heading_tag($tag) {
    $tag = strtolower((string) $tag);
    return in_array($tag, ['h1','h2','h3','h4','h5','h6'], true) ? $tag : 'h2';
}

/**
 * Hjälp: dela upp items på första heading (som i splitItemsOnFirstHeading i edit.js)
 */
function dcw_split_on_first_heading($items) {
    if (!is_array($items) || empty($items)) {
        return [null, [], -1];
    }
    $firstIndex = -1;
    foreach ($items as $i => $it) {
        if (is_array($it) && ($it['type'] ?? '') === 'heading') {
            $firstIndex = $i;
            break;
        }
    }
    if ($firstIndex === -1) {
        // Ingen heading — använd första elementet som "first" för summary
        $firstIndex = 0;
    }
    $first = $items[$firstIndex] ?? null;
    $rest  = [];
    foreach ($items as $i => $it) {
        if ($i !== $firstIndex) {
            $rest[] = $it;
        }
    }
    return [$first, $rest, $firstIndex];
}

/**
 * Hjälp: rendera en lista av items (heading/paragraph/list/button)
 */
function dcw_render_items($items, $args = []) {
    if (!is_array($items) || empty($items)) {
        return '';
    }

    $button_class        = isset($args['button_class']) ? sanitize_html_class($args['button_class']) : 'btn';
    $content_orientation = !empty($args['content_orientation']); // hook om du vill
    $extra_class         = isset($args['class']) ? sanitize_html_class($args['class']) : '';
    $modal_type          = isset($args['modal_type']) ? (string) $args['modal_type'] : '';

    ob_start();
    echo '<div class="text-wrapper ' . esc_attr($extra_class) . '">';

    foreach ($items as $item) {
        if (!is_array($item)) { continue; }
        $type = $item['type'] ?? '';
        switch ($type) {
            case 'heading': {
                $tag = dcw_safe_heading_tag($item['headingType'] ?? 'h2');
                $text = isset($item['text']) ? wp_kses_post($item['text']) : '';
                $size = isset($item['size']) ? sanitize_html_class($item['size']) : '';
                printf('<%1$s class="heading %2$s">%3$s</%1$s>', esc_html($tag), esc_attr($size), $text);
                break;
            }
            case 'paragraph': {
                $text = isset($item['text']) ? wp_kses_post($item['text']) : '';
                echo '<p class="paragraph">' . $text . '</p>';
                break;
            }
            case 'list': {
                $list = isset($item['list']) && is_array($item['list']) ? $item['list'] : [];
                if (!empty($list)) {
                    echo '<ul class="list">';
                    foreach ($list as $li) {
                        echo '<li>' . esc_html($li) . '</li>';
                    }
                    echo '</ul>';
                }
                break;
            }
                case 'button': {
                $url       = isset($item['url']) ? esc_url($item['url']) : '#';
                $label     = isset($item['text']) ? wp_kses_post($item['text']) : esc_html__('Button', 'textdomain');
                $isPrimary = !empty($item['isPrimary']);
                $classes   = $button_class . ' ' . ($isPrimary ? 'is-primary' : 'is-secondary');

                $iconRaw   = isset($item['icon']) ? (string) $item['icon'] : '';
                $iconColor = isset($item['iconColor']) ? (string) $item['iconColor'] : '';

                // *** Här speglar vi save.js: cards / dropdown => <hr />
                if ($modal_type === 'cards' || $modal_type === 'dropdown') {
                    echo '<hr />';
                }

                echo '<a class="' . esc_attr($classes) . '" href="' . $url . '" target="_blank" rel="noopener nofollow">';
                if ($iconRaw !== '') {
                    echo '<span class="btn-icon" data-fa-content="' . esc_attr($iconRaw) . '" style="' . ($iconColor ? 'color:' . esc_attr($iconColor) . ';' : '') . '"></span>';
                }
                echo '<span class="btn-label">' . $label . '</span>';
                echo '</a>';
                break;
            }
            default:
                // okänt item — ignorera tyst
                break;
        }
    }

    echo '</div>';
    return ob_get_clean();
}

/**
 * Hjälp: rendera "summary"-delen (endast första heading)
 */
function dcw_render_summary_heading($first) {
    $fallback = esc_html__('Untitled', 'textdomain');
    if (!is_array($first)) {
        return '<h2 class="heading">' . $fallback . '</h2>';
    }
    $tag  = dcw_safe_heading_tag($first['headingType'] ?? 'h2');
    $text = isset($first['text']) ? wp_kses_post($first['text']) : $fallback;
    $size = isset($first['size']) ? sanitize_html_class($first['size']) : '';
    return sprintf('<%1$s class="heading %2$s">%3$s</%1$s>', esc_html($tag), esc_attr($size), $text);
}

/**
 * Huvud-render: kallas från register_block_type([... 'render_callback' => ... ])
 *
 * @param array $attributes Block attributes
 * @param string $content   (ignoreras här – vi SSR:ar allt)
 */
function dcw_render_block($attributes, $content) {
    $backgroundColor = isset($attributes['backgroundColor']) ? (string) $attributes['backgroundColor'] : '';
    $faIcon          = isset($attributes['faIcon']) ? (string) $attributes['faIcon'] : '""';
    $faIconColor     = isset($attributes['faIconColor']) ? (string) $attributes['faIconColor'] : '#E03131';
    $globalItems     = isset($attributes['items']) && is_array($attributes['items']) ? $attributes['items'] : [];
    $cards           = isset($attributes['cards']) && is_array($attributes['cards']) ? $attributes['cards'] : [];
    $contentOrient   = !empty($attributes['contentOrientation']);
    $align           = isset($attributes['align']) ? sanitize_html_class($attributes['align']) : '';
    $cardBorder      = isset($attributes['cardBorder']) ? sanitize_html_class($attributes['cardBorder']) : '';
    $modal_type      = isset($attributes['modalType']) ? (string) $attributes['modalType'] : '';
    // Wrapper style (CSS custom props används i ditt SCSS)
    $wrapper_style_parts = [];
    if ($backgroundColor) { $wrapper_style_parts[] = 'background-color:' . esc_attr($backgroundColor); }
    if ($faIcon !== '')   { $wrapper_style_parts[] = '--faIcon:' . esc_attr($faIcon); }
    if ($faIconColor)     { $wrapper_style_parts[] = '--iconColor:' . esc_attr($faIconColor); }
    $wrapper_style = implode(';', $wrapper_style_parts);

    ob_start();
    ?>
    <div class="cards-wrapper" style="<?php echo esc_attr($wrapper_style); ?>">
      <article class="faq-modal-article article">
        <section class="faq-modal-section">
          <?php
            // Global sektion överst
            echo dcw_render_items($globalItems, [
                'button_class'        => 'btn',
                'content_orientation' => $contentOrient,
                'class'               => $align,
                'modal_type'          => $modal_type,
            ]);
          ?>
        </section>

        <div class="faq-grid">
        <?php foreach ($cards as $card): ?>
            <?php
                $card_items    = isset($card['items']) && is_array($card['items']) ? $card['items'] : [];
                $card_bg       = isset($card['backgroundColor']) ? (string) $card['backgroundColor'] : '';
                $card_align    = isset($card['align']) ? sanitize_html_class($card['align']) : $align;
                [$first, $rest] = dcw_split_on_first_heading($card_items);

                $card_style = $card_bg ? 'background-color:' . esc_attr($card_bg) . ';' : '';
                $classes = trim('accordion-card ' . $card_align . ' ' . $cardBorder);
            ?>
            <details class="<?php echo esc_attr($classes); ?>" style="<?php echo esc_attr($card_style); ?>">
              <summary class="accordion-card__summary" role="button" aria-expanded="false">
                <?php echo dcw_render_summary_heading($first); ?>
              </summary>
              <div class="accordion-card__content">
                <?php
                  echo dcw_render_items($rest, [
                      'button_class'        => 'card-button',
                      'content_orientation' => $contentOrient,
                      'class'               => $card_align,
                      'modal_type'          => $modal_type,
                  ]);
                ?>
              </div>
            </details>
        <?php endforeach; ?>
        </div>
      </article>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Registrera render callback när blocket registreras.
 * Justera 'namespace/block-name' till ditt block-namn.
 */
add_action('init', function () {
    register_block_type(__DIR__, [
        'render_callback' => 'dcw_render_block',
    ]);
});
