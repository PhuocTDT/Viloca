import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/colors';
import { useT } from '@/src/lib/i18n';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

/**
 * Alert.alert() không render gì trên react-native-web, nên dùng Modal này
 * thay cho Alert.alert() ở những nơi cần hoạt động đúng trên cả web lẫn native.
 */
export function InfoAlertModal({ visible, title, message, onClose }: Props) {
  const t = useT();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.centerWrap} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.okBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.okText}>{t('alertOk')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  centerWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  card: {
    width: '100%', maxWidth: 320,
    backgroundColor: colors.nomad.surface,
    borderRadius: 20, padding: 20, gap: 8,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.nomad.onSurface },
  message: { fontSize: 14, color: colors.nomad.onSurfaceVariant, lineHeight: 20 },
  okBtn: {
    alignSelf: 'flex-end', marginTop: 8,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.nomad.primary,
  },
  okText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
