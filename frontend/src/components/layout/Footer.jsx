export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
      <div className="text-center text-sm text-gray-600">
        <p>
          © {new Date().getFullYear()} Instituto Superior Técnico de Enfermería
          "María Parado de Bellido"
        </p>
        <p className="mt-1">Ayacucho, Perú</p>
      </div>
    </footer>
  );
}
