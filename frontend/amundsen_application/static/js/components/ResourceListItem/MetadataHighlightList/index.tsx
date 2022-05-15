// Copyright Contributors to the Amundsen project.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import { TableIcon } from 'components/SVGIcons';
import { DashboardSearchHighlights, IconSizes, TableSearchHighlights } from 'interfaces';

export interface MetadataHighlightListProps {
  fieldName: string;
  highlightedMetadataList: string;
}
// TODO add icons mapping for columns, charts, queries

// const fieldToIconMapping = {
//   columns:  
// }

// const formatHighlightedItemList = (fieldName, highlightedItems): string => {
//   const formatted = ;
//   return formatted;
// }

const MetadataHighlightList: React.FC<MetadataHighlightListProps> = ({ fieldName, highlightedMetadataList }) => (
  <div className='metadata-highlight-list'>
    <div className='highlight-icon'><TableIcon size={IconSizes.SMALL}/></div>
    <div
    className='highlight-content body-secondary-3 truncated'
    dangerouslySetInnerHTML={{
      __html: `<span class='section-title'>Matching ${fieldName}:</span> ${highlightedMetadataList}`
      }}>
    </div>
  </div>
);
export default MetadataHighlightList;
