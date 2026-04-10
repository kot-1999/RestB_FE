export default function renderPagination(pagination, renderFunc) {
    const $container = $('#pagination');
    if (!$container.length) return;

    const currentPage = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;
    const total = Number(pagination.total) || 0;

    const totalPages = Math.ceil(total / limit);

    $container.empty();
    if (totalPages <= 1) {
        return
    }

    const maxVisible = 6; // middle pages only

    const $ul = $('<ul class="pagination-list">');

    const createBtn = (label, page, className, { disabled = false, active = false } = {}) => {
        const $li = $('<li>');
        const $a = $('<a>', {
            href: '#',
            text: label,
            'data-page': page,
            class: `pagination-btn ${className}`
        });

        if (disabled) {
            $a.addClass('disabled')
        }
        if (active) {
            $li.addClass('active')
        }

        $li.append($a);
        return $li;
    };

    const createDots = () => {
        const $li = $('<li>');
        const $span = $('<span>', {
            text: '...',
            class: 'pagination-dots'
        });
        $li.append($span);
        return $li;
    };

    // --- Prev ---
    $ul.append(
        createBtn('Prev', currentPage - 1, 'prev', {
            disabled: currentPage === 1
        })
    );

    // --- Always first ---
    $ul.append(
        createBtn(1, 1, 'page', {
            active: currentPage === 1
        })
    );

    // --- Calculate window ---
    let start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end >= totalPages) {
        end = totalPages - 1;
        start = Math.max(2, end - maxVisible + 1);
    }

    // --- Left dots ---
    if (start > 2) {
        $ul.append(createDots());
    }

    // --- Middle pages ---
    for (let i = start; i <= end; i++) {
        $ul.append(
            createBtn(i, i, 'page', {
                active: i === currentPage
            })
        );
    }

    // --- Right dots ---
    if (end < totalPages - 1) {
        $ul.append(createDots());
    }

    // --- Always last ---
    if (totalPages > 1) {
        $ul.append(
            createBtn(totalPages, totalPages, 'page', {
                active: currentPage === totalPages
            })
        );
    }

    // --- Next ---
    $ul.append(
        createBtn('Next', currentPage + 1, 'next', {
            disabled: currentPage === totalPages
        })
    );

    $container.append($ul);

    // --- Click handler ---
    $container.off('click', 'a').on('click', 'a', function (e) {
        e.preventDefault();

        const $el = $(this);
        if ($el.hasClass('disabled')) return;

        const newPage = Number($el.data('page'));
        if (!newPage || newPage === currentPage) return;

        renderFunc({ page: newPage });
    });
}