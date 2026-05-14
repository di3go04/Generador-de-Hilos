import { PrismaClient } from "@prisma/client";

async function main() {
  console.log("Iniciando prueba con errorFormat...");
  try {
    const prisma = new PrismaClient({
      errorFormat: "pretty",
    });
    console.log("Instancia creada correctamente.");
    const users = await prisma.user.findMany();
    console.log("Consulta exitosa. Usuarios encontrados:", users.length);
  } catch (error) {
    console.error("ERROR AL INICIAR PRISMA:", error);
  }
}

main();
