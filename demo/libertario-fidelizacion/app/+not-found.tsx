import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Libertario" }} />
      <View style={styles.caja}>
        <Text style={styles.titulo}>Esa página no está en la casa.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkTexto}>Volver</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  caja: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  titulo: {
    fontSize: 22,
    color: "#1b1612",
  },
  link: {
    marginTop: 16,
  },
  linkTexto: {
    fontSize: 16,
    color: "#7a4328",
  },
});
