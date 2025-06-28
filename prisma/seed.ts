import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with initial categories...')

  const categories = [
    {
      name: 'Appetizers',
      description: 'Small dishes served before the main course',
      image: '/images/categories/appetizers.jpg'
    },
    {
      name: 'Main Dishes',
      description: 'Primary course dishes',
      image: '/images/categories/main-dishes.jpg'
    },
    {
      name: 'Side Dishes',
      description: 'Accompanying dishes served with main courses',
      image: '/images/categories/side-dishes.jpg'
    },
    {
      name: 'Soups',
      description: 'Liquid dishes, often served as starters',
      image: '/images/categories/soups.jpg'
    },
    {
      name: 'Salads',
      description: 'Fresh vegetable and fruit dishes',
      image: '/images/categories/salads.jpg'
    },
    {
      name: 'Desserts',
      description: 'Sweet dishes served at the end of meals',
      image: '/images/categories/desserts.jpg'
    },
    {
      name: 'Breads',
      description: 'Various types of bread and baked goods',
      image: '/images/categories/breads.jpg'
    },
    {
      name: 'Beverages',
      description: 'Drinks and cocktails',
      image: '/images/categories/beverages.jpg'
    },
    {
      name: 'Breakfast',
      description: 'Morning meals and brunch dishes',
      image: '/images/categories/breakfast.jpg'
    },
    {
      name: 'Snacks',
      description: 'Quick bites and finger foods',
      image: '/images/categories/snacks.jpg'
    },
    {
      name: 'Vegetarian',
      description: 'Dishes without meat or fish',
      image: '/images/categories/vegetarian.jpg'
    },
    {
      name: 'Vegan',
      description: 'Plant-based dishes without animal products',
      image: '/images/categories/vegan.jpg'
    },
    {
      name: 'Gluten-Free',
      description: 'Dishes without gluten-containing ingredients',
      image: '/images/categories/gluten-free.jpg'
    },
    {
      name: 'Quick & Easy',
      description: 'Simple recipes that can be made in 30 minutes or less',
      image: '/images/categories/quick-easy.jpg'
    },
    {
      name: 'Slow Cooker',
      description: 'Recipes designed for slow cooking',
      image: '/images/categories/slow-cooker.jpg'
    },
    {
      name: 'One Pot',
      description: 'Recipes that can be made in a single pot or pan',
      image: '/images/categories/one-pot.jpg'
    }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 