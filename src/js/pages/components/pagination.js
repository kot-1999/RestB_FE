
export default function renderPagination(pagination, renderFunc) {
    const $container = $('#pagination');
    if (!$container.length) return;

    const currentPage = Number(pagination.page);
    const limit = Number(pagination.limit);
    const total = Number(pagination.total);

    const totalPages = Math.ceil(total / limit);

    $container.empty();

    if (totalPages <= 1) return;

    const maxItems = 10;
    const maxNumbers = maxItems - 2; // prev + next

    // --- calculate visible pages ---
    let start = Math.max(1, currentPage - Math.floor(maxNumbers / 2));
    let end = start + maxNumbers - 1;

    if (end > totalPages) {
        end = totalPages;
        start = Math.max(1, end - maxNumbers + 1);
    }

    const createBtn = (label, page, className, options = {}) => {
        const { disabled = false, active = false } = options;

        const $li = $('<li>');
        const $a = $('<a>', {
            href: '#',
            text: label,
            'data-page': page,
            class: `pagination-btn ${className}`
        });

        if (disabled) $a.addClass('disabled');
        if (active) $a.addClass('active');

        $li.append($a);
        return $li;
    };

    // --- Prev ---
    $container.append(
        createBtn('Prev', currentPage - 1, 'prev', {
            disabled: currentPage === 1
        })
    );

    // --- Pages ---
    for (let i = start; i <= end; i++) {
        $container.append(
            createBtn(i, i, 'page', {
                active: i === currentPage
            })
        );
    }

    // --- Next ---
    $container.append(
        createBtn('Next', currentPage + 1, 'next', {
            disabled: currentPage === totalPages
        })
    );

    // --- Click handler (delegated, safe for rerenders) ---
    $container.off('click', 'a').on('click', 'a', function (e) {
        e.preventDefault();

        const $el = $(this);

        if ($el.hasClass('disabled')) return;

        const page = Number($el.data('page'));
        if (!page || page === currentPage) return;

        renderFunc({page});
    });
}