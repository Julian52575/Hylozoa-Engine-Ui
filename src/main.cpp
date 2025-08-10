//
// EPITECH PROJECT, 2025
// Hylozoa Engine Ui
// File description:
// main
//
#include <iostream>
#include <Hylozoa-Engine/Placeholder/Placeholder.hpp>
#include "Dummy/Dummy.hpp"

int main(void)
{
    Hylozoa::Placeholder pl;
    HylozoaUi::Dummy dm;

    std::cout << "Hello from Ui main." << std::endl;
    pl.helloWorld();
    dm.helloWorld();
    return pl.returnInt(0);
}
