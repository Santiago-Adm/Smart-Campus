import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { DOCUMENT_STATUS_LABELS, DOCUMENT_STATUS_COLORS } from '@/constants/documents';

/**
 * Badge para mostrar el estado de un documento
 */
export default function DocumentStatusBadge({ status, size = 'md' }) {
  const label = DOCUMENT_STATUS_LABELS[status] || status;
  const variant = DOCUMENT_STATUS_COLORS[status] || 'default';

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}

DocumentStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};
