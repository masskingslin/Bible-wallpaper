import React from 'react';
import { SettingsModal, SettingsModalProps } from './SettingsModal';

export type AutoChangerModalProps = SettingsModalProps;

export const AutoChangerModal: React.FC<SettingsModalProps> = (props) => {
  return <SettingsModal {...props} initialTab={props.initialTab || 'autochanger'} />;
};

export default AutoChangerModal;
