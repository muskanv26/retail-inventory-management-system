package com.retail.inventory.config;

import com.retail.inventory.entity.Inventory;
import com.retail.inventory.entity.Product;
import com.retail.inventory.entity.Warehouse;
import com.retail.inventory.repository.InventoryRepository;
import com.retail.inventory.repository.ProductRepository;
import com.retail.inventory.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() > 0) {
            log.info("Products already exist in database. Skipping data initialization.");
            return;
        }

        log.info("Seeding VELORA retail product catalog and multi-warehouse inventory dataset...");

        // Ensure default fulfillment warehouses exist
        Warehouse whNorth = warehouseRepository.findByCode("WH-NORTH")
                .orElseGet(() -> warehouseRepository.save(Warehouse.builder()
                        .code("WH-NORTH")
                        .name("North Region Distribution Center")
                        .location("Gurugram, Haryana")
                        .capacity(12000)
                        .active(true)
                        .build()));

        Warehouse whCentral = warehouseRepository.findByCode("WH-CENTRAL")
                .orElseGet(() -> warehouseRepository.save(Warehouse.builder()
                        .code("WH-CENTRAL")
                        .name("Central Operations Fulfillment Hub")
                        .location("Mumbai, Maharashtra")
                        .capacity(15000)
                        .active(true)
                        .build()));

        Warehouse whWest = warehouseRepository.findByCode("WH-WEST")
                .orElseGet(() -> warehouseRepository.save(Warehouse.builder()
                        .code("WH-WEST")
                        .name("West Coast Logistics Depot")
                        .location("Pune, Maharashtra")
                        .capacity(9000)
                        .active(true)
                        .build()));

        Warehouse whSouth = warehouseRepository.findByCode("WH-SOUTH")
                .orElseGet(() -> warehouseRepository.save(Warehouse.builder()
                        .code("WH-SOUTH")
                        .name("South Region Supply Center")
                        .location("Bengaluru, Karnataka")
                        .capacity(11000)
                        .active(true)
                        .build()));

        List<Warehouse> warehouses = List.of(whNorth, whCentral, whWest, whSouth);

        List<Product> products = new ArrayList<>();

        // Create 50 Fictional VELORA Products
        products.add(createProduct("VLR-TOP-001", "Miraweave Utility Top", "Lightweight breathable weave top with subtle chest pockets.", "Everyday Wear", "VELORA Core", "Women", "1849.00", "2499.00", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80", 4.8, 114, "XS, S, M, L", "Sage Green, Sand, Off-White"));
        products.add(createProduct("VLR-TRS-002", "Orin Everyday Trousers", "Tailored stretch cotton trousers designed for modern movement.", "Workwear", "VELORA Tailored", "Men", "2499.00", "3299.00", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80", 4.9, 88, "28, 30, 32, 34, 36", "Charcoal, Khaki, Midnight Navy"));
        products.add(createProduct("VLR-SHR-003", "Kivo Layer Shirt", "Soft brushed cotton button-down shirt ideal for transitional wear.", "Layering", "VELORA Studio", "Unisex", "1999.00", "2799.00", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80", 4.7, 96, "S, M, L, XL", "Slate Blue, Heather Grey, Olive"));
        products.add(createProduct("VLR-SHR-004", "Nera Soft Overshirt", "Relaxed fit heavy-twill overshirt with reinforced utility stitching.", "Casual", "VELORA Core", "Men", "2299.00", "3199.00", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80", 4.8, 142, "M, L, XL, XXL", "Workwear Brown, Washed Navy"));
        products.add(createProduct("VLR-SWT-005", "Talen Relaxed Pullover", "Midweight French terry pullover sweatshirt with ribbed trim.", "Layering", "VELORA Core", "Unisex", "1799.00", "2399.00", "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80", 4.6, 175, "XS, S, M, L, XL", "Oatmeal, Terracotta, Charcoal"));
        products.add(createProduct("VLR-JKT-006", "Sova Field Jacket", "Weather-resistant cotton canvas field jacket with multi-pocket storage.", "Seasonal", "VELORA Elements", "Men", "3899.00", "5299.00", "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80", 4.9, 64, "S, M, L, XL", "Dark Olive, Forest Black"));
        products.add(createProduct("VLR-BAG-007", "Riven Carry Tote", "Durable water-repellent canvas tote bag with leather shoulder straps.", "Accessories", "VELORA Studio", "Unisex", "2199.00", "2999.00", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80", 4.8, 120, "One Size", "Natural Canvas, Tan Leather"));
        products.add(createProduct("VLR-FTW-008", "Mero Canvas Runner", "Low-profile lightweight sneaker with cushioned ergonomic footbed.", "Footwear", "VELORA Active", "Unisex", "2699.00", "3599.00", "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80", 4.7, 210, "UK 6, UK 7, UK 8, UK 9, UK 10", "Chalk White, Stone Grey"));
        products.add(createProduct("VLR-SWT-009", "Arlo Merino Crewneck", "Fine-gauge 100% Australian Merino wool knit sweater.", "Layering", "VELORA Studio", "Men", "2999.00", "4199.00", "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80", 4.9, 82, "S, M, L, XL", "Camel, Midnight, Heather Oatmeal"));
        products.add(createProduct("VLR-JKT-010", "Cael Structured Trench", "Classic double-breasted cotton gabardine trench coat with belt.", "Seasonal", "VELORA Tailored", "Women", "4999.00", "6999.00", "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80", 4.9, 53, "XS, S, M, L", "Classic Stone, Deep Black"));
        products.add(createProduct("VLR-TRS-011", "Elian Pleated Chino", "Relaxed fit pleated cotton twill chino with sharp front crease.", "Workwear", "VELORA Core", "Men", "2199.00", "2899.00", "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80", 4.6, 95, "30, 32, 34, 36", "British Khaki, Washed Navy"));
        products.add(createProduct("VLR-SHR-012", "Voda Linen Shirt", "Breathable French linen button-front shirt with resort collar.", "Casual", "VELORA Core", "Unisex", "1899.00", "2499.00", "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80", 4.8, 168, "XS, S, M, L, XL", "Sky Blue, Off-White, Sage"));
        products.add(createProduct("VLR-JKT-013", "Zephyr Trail Anorak", "Packable wind-resistant shell jacket with quarter-zip hood.", "Travel", "VELORA Elements", "Unisex", "3299.00", "4499.00", "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80", 4.7, 72, "S, M, L, XL", "Mustard, Clay, Slate"));
        products.add(createProduct("VLR-TOP-014", "Torin Slub Tee", "Organic slub cotton crewneck tee with reinforced ribbed collar.", "Everyday Wear", "VELORA Core", "Unisex", "899.00", "1299.00", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80", 4.7, 340, "XS, S, M, L, XL, XXL", "White, Washed Black, Olive, Heather"));
        products.add(createProduct("VLR-VST-015", "Dax Utility Vest", "Multi-pocket tactical utility vest in water-resistant ripstop.", "Travel", "VELORA Elements", "Unisex", "2499.00", "3499.00", "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80", 4.8, 62, "S, M, L", "Coyote Tan, Charcoal"));
        products.add(createProduct("VLR-DRS-016", "Lyra Silk Wrap Dress", "Flowing crepe silk wrap dress with adjustable sash waist.", "Everyday Wear", "VELORA Tailored", "Women", "3499.00", "4999.00", "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80", 4.9, 104, "XS, S, M, L", "Emerald, Black Plum"));
        products.add(createProduct("VLR-SHR-017", "Soren Brushed Flannel", "Heavyweight double-brushed cotton flannel plaid shirt.", "Layering", "VELORA Core", "Men", "2099.00", "2799.00", "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80", 4.7, 188, "S, M, L, XL", "Forest Plaid, Rust Plaid"));
        products.add(createProduct("VLR-JKT-018", "Vanya Tailored Blazer", "Single-breasted wool blend tailored blazer with horn buttons.", "Workwear", "VELORA Tailored", "Women", "4299.00", "5999.00", "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80", 4.9, 79, "XS, S, M, L", "Navy Houndstooth, Charcoal"));
        products.add(createProduct("VLR-JNS-019", "Kael Tapered Denim", "13.5oz organic cotton tapered fit selvedge denim jeans.", "Casual", "VELORA Denim", "Men", "2599.00", "3499.00", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80", 4.8, 220, "28, 30, 32, 34, 36", "Raw Indigo, Washed Mid-Blue"));
        products.add(createProduct("VLR-BAG-020", "Mare Travel Duffle", "Waterproof heavy canvas weekender duffle bag with leather trim.", "Travel", "VELORA Studio", "Unisex", "3699.00", "4999.00", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80", 4.9, 91, "One Size", "Olive Canvas, Espresso Leather"));
        products.add(createProduct("VLR-FTW-021", "Astir Minimal Leather Sneaker", "Handcrafted full-grain leather low top sneaker with gum sole.", "Footwear", "VELORA Core", "Unisex", "3199.00", "4299.00", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80", 4.8, 145, "UK 6, UK 7, UK 8, UK 9, UK 10", "Bright White, Tan Accent"));
        products.add(createProduct("VLR-TOP-022", "Nicos Ribbed Tank", "Soft stretch modal ribbed tank top designed for layering.", "Everyday Wear", "VELORA Core", "Women", "799.00", "1199.00", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80", 4.5, 112, "XS, S, M, L", "Ivory, Heather Grey, Black"));
        products.add(createProduct("VLR-TRS-023", "Bowen Hybrid Cargo Pant", "Modern slim cargo pant with concealed zip utility pockets.", "Casual", "VELORA Elements", "Men", "2399.00", "3199.00", "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80", 4.7, 134, "30, 32, 34, 36", "Olive Drab, Sand, Black"));
        products.add(createProduct("VLR-JKT-024", "Eira Wool Overcoat", "Long double-faced wool wrap overcoat with notch lapels.", "Seasonal", "VELORA Tailored", "Women", "6499.00", "8999.00", "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80", 4.9, 48, "XS, S, M, L", "Camel, Charcoal Melt"));
        products.add(createProduct("VLR-SHT-025", "Calo Linen Short", "Tailored linen-cotton blend 7-inch inseam summer shorts.", "Casual", "VELORA Core", "Men", "1499.00", "1999.00", "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80", 4.6, 88, "S, M, L, XL", "Stone, Navy, Olive"));
        products.add(createProduct("VLR-LEG-026", "Nova Seamless Legging", "High-waisted compression seamless performance leggings.", "Everyday Wear", "VELORA Active", "Women", "1699.00", "2299.00", "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&auto=format&fit=crop&q=80", 4.8, 250, "XS, S, M, L", "Midnight, Graphite, Sage"));
        products.add(createProduct("VLR-BAG-027", "Solis Canvas Backpack", "Compact commuter backpack with padded 15-inch laptop sleeve.", "Travel", "VELORA Elements", "Unisex", "2799.00", "3799.00", "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&auto=format&fit=crop&q=80", 4.8, 160, "One Size", "Slate Grey, Matte Black"));
        products.add(createProduct("VLR-FTW-028", "Tarek Leather Chelsea Boot", "Sleek pull-on leather Chelsea boots with durable elastic side gores.", "Footwear", "VELORA Tailored", "Men", "3999.00", "5499.00", "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop&q=80", 4.9, 97, "UK 7, UK 8, UK 9, UK 10", "Antique Espresso, Black Nappa"));
        products.add(createProduct("VLR-SWT-029", "Alra Cable Knit Cardigan", "Chunky slouchy cable knit open-front cardigan sweater.", "Layering", "VELORA Studio", "Women", "2799.00", "3799.00", "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80", 4.7, 85, "S, M, L", "Cream, Soft Taupe"));
        products.add(createProduct("VLR-JKT-030", "Varo Tech Commuter Jacket", "Waterproof breathable softshell jacket for daily weather protection.", "Workwear", "VELORA Elements", "Men", "3499.00", "4799.00", "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80", 4.8, 105, "M, L, XL", "Matte Black, Deep Navy"));
        products.add(createProduct("VLR-SKT-031", "Mirelle Satin Slip Skirt", "Bias-cut satin midi slip skirt with comfortable elastic waist.", "Everyday Wear", "VELORA Studio", "Women", "1999.00", "2799.00", "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80", 4.7, 76, "XS, S, M, L", "Champagne, Midnight"));
        products.add(createProduct("VLR-SWT-032", "Ronin Oversized Hoodie", "Heavyweight 450gsm organic cotton fleece pullover hoodie.", "Casual", "VELORA Core", "Unisex", "2299.00", "2999.00", "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80", 4.8, 310, "S, M, L, XL, XXL", "Heather Grey, Faded Black, Khaki"));
        products.add(createProduct("VLR-JKT-033", "Kensley Cropped Denim Jacket", "Classic vintage wash trucker denim jacket with cropped hem.", "Layering", "VELORA Denim", "Women", "2699.00", "3599.00", "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80", 4.6, 94, "XS, S, M, L", "Light Vintage Blue"));
        products.add(createProduct("VLR-TRS-034", "Senna Relaxed Linen Trousers", "Drawstring waist linen-cotton relaxed trousers for warm climates.", "Travel", "VELORA Core", "Women", "2199.00", "2899.00", "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80", 4.7, 118, "XS, S, M, L", "Natural Flax, Pure White"));
        products.add(createProduct("VLR-BAG-035", "Oria Minimal Crossbody Bag", "Structured grain leather flap crossbody bag with magnetic closure.", "Accessories", "VELORA Studio", "Women", "2499.00", "3499.00", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80", 4.9, 130, "One Size", "Tan, Noir, Burgundy"));
        products.add(createProduct("VLR-FTW-036", "Zale Suede Loafer", "Soft Italian suede penny loafer with flexible rubber driving sole.", "Footwear", "VELORA Tailored", "Men", "3499.00", "4699.00", "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80", 4.8, 89, "UK 7, UK 8, UK 9, UK 10", "Snuff Suede, Navy Suede"));
        products.add(createProduct("VLR-TOP-037", "Corin Heavyweight Pocket Tee", "240gsm combed cotton boxy fit pocket tee.", "Everyday Wear", "VELORA Core", "Men", "1099.00", "1499.00", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80", 4.7, 280, "S, M, L, XL", "Washed White, Cement, Olive"));
        products.add(createProduct("VLR-DRS-038", "Thalia Pleated Midi Dress", "Long sleeve pleated shirt dress with tie belt waist.", "Workwear", "VELORA Tailored", "Women", "3299.00", "4499.00", "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80", 4.8, 67, "XS, S, M, L", "Navy, Burgundy"));
        products.add(createProduct("VLR-JKT-039", "Kaelen Waterproof Shell", "Fully seam-sealed 3-layer waterproof alpine jacket.", "Seasonal", "VELORA Elements", "Unisex", "4199.00", "5799.00", "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80", 4.9, 52, "S, M, L, XL", "Citron Yellow, Slate Black"));
        products.add(createProduct("VLR-JKT-040", "Brin Travel Packable Puffer", "Ultra-lightweight packable down insulator jacket with storage pouch.", "Travel", "VELORA Elements", "Unisex", "3699.00", "4999.00", "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80", 4.8, 142, "S, M, L, XL", "Matte Black, Forest Green"));
        products.add(createProduct("VLR-ACC-041", "Veda Merino Beanie", "Rib-knit 100% extra-fine Merino wool beanie hat.", "Accessories", "VELORA Core", "Unisex", "999.00", "1399.00", "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80", 4.8, 190, "One Size", "Charcoal, Oat, Ochre"));
        products.add(createProduct("VLR-TRS-042", "Joren Slim Fit Suit Trousers", "Flat-front stretch wool suit trousers with tab waist.", "Workwear", "VELORA Tailored", "Men", "2899.00", "3899.00", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80", 4.8, 71, "30, 32, 34, 36", "Charcoal Grey, Navy"));
        products.add(createProduct("VLR-TOP-043", "Myra Drape Front Blouse", "Silky crepe long sleeve blouse with elegant draped neckline.", "Workwear", "VELORA Tailored", "Women", "1999.00", "2699.00", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80", 4.7, 83, "XS, S, M, L", "Ivory, Dusty Rose"));
        products.add(createProduct("VLR-SHR-044", "Kian Corduroy Shirt", "Fine-wale cotton corduroy long sleeve shirt with pearl buttons.", "Layering", "VELORA Studio", "Men", "2199.00", "2999.00", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80", 4.8, 115, "S, M, L, XL", "Chestnut, Pine Green"));
        products.add(createProduct("VLR-ACC-045", "Silo Leather Belt", "Full-grain vegetable-tanned leather belt with matte brass buckle.", "Accessories", "VELORA Core", "Unisex", "1299.00", "1799.00", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80", 4.9, 160, "S, M, L, XL", "Cognac, Black"));
        products.add(createProduct("VLR-ACC-046", "Vesper Leather Cardholder", "Slim 5-slot leather cardholder with RFID protection lining.", "Accessories", "VELORA Studio", "Unisex", "999.00", "1499.00", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80", 4.9, 210, "One Size", "Saddle Tan, Midnight Black"));
        products.add(createProduct("VLR-SWT-047", "Aris Recycled Fleece Zip", "100% recycled polyester thermal fleece jacket with zip chest pocket.", "Seasonal", "VELORA Elements", "Unisex", "2499.00", "3299.00", "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80", 4.7, 128, "S, M, L, XL", "Navy / Olive, Oat"));
        products.add(createProduct("VLR-JNS-048", "Elene High-Rise Straight Jean", "Classic 100% cotton rigid denim straight leg jean in light wash.", "Casual", "VELORA Denim", "Women", "2499.00", "3299.00", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80", 4.8, 175, "26, 28, 30, 32", "Light Vintage, Mid Indigo"));
        products.add(createProduct("VLR-FTW-049", "Nori Slip-On Canvas Mule", "Casual slip-on canvas mule with cushioned cork footbed.", "Footwear", "VELORA Core", "Unisex", "1899.00", "2499.00", "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80", 4.6, 92, "UK 6, UK 7, UK 8, UK 9", "Natural Flax, Washed Black"));
        products.add(createProduct("VLR-BAG-050", "Kaelo Modular Utility Bag", "Modular sling bag with removable strap and MOLLE webbing.", "Travel", "VELORA Elements", "Unisex", "2199.00", "2999.00", "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&auto=format&fit=crop&q=80", 4.8, 108, "One Size", "Tactical Black, Coyote Tan"));

        // Save products and distribute inventory across warehouses
        int productIndex = 0;
        for (Product prod : products) {
            Product savedProd = productRepository.save(prod);

            // Distribute across warehouses with varied inventory levels
            for (int w = 0; w < warehouses.size(); w++) {
                Warehouse wh = warehouses.get(w);

                int qtyOnHand = 25;
                int qtyReserved = 0;

                // Create inventory scenarios: healthy stock, low stock, out of stock, reserved stock
                if (productIndex % 7 == 0 && w == 0) {
                    qtyOnHand = 3; // Low stock alert scenario
                } else if (productIndex % 11 == 0 && w == 1) {
                    qtyOnHand = 0; // Out of stock scenario
                } else if (productIndex % 5 == 0) {
                    qtyOnHand = 18;
                    qtyReserved = 4; // Reserved inventory scenario
                } else {
                    qtyOnHand = 35 + (productIndex * 3) % 40;
                }

                inventoryRepository.save(Inventory.builder()
                        .product(savedProd)
                        .warehouseCode(wh.getCode())
                        .quantityOnHand(qtyOnHand)
                        .quantityReserved(qtyReserved)
                        .reorderLevel(10)
                        .build());
            }
            productIndex++;
        }

        log.info("Successfully seeded {} VELORA products with multi-warehouse inventory across 4 regional hubs!", products.size());
    }

    private Product createProduct(String sku, String name, String desc, String cat, String brand, String gender, String price, String origPrice, String img, double rating, int reviews, String sizes, String colors) {
        return Product.builder()
                .sku(sku)
                .name(name)
                .description(desc)
                .category(cat)
                .brand(brand)
                .gender(gender)
                .unitPrice(new BigDecimal(price))
                .originalPrice(new BigDecimal(origPrice))
                .imageUrl(img)
                .secondaryImageUrl(img)
                .rating(rating)
                .reviewCount(reviews)
                .sizes(sizes)
                .colors(colors)
                .active(true)
                .build();
    }
}

